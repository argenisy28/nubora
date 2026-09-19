import json
import os
import uuid
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["ASSETS_TABLE"])


VALID_TYPES = {
    "laptop",
    "desktop",
    "server",
    "printer",
    "network-device",
    "mobile-device",
    "other"
}

VALID_STATUSES = {
    "available",
    "in-use",
    "maintenance",
    "retired",
    "lost"
}


def create_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "content-type": "application/json"
        },
        "body": json.dumps(body)
    }


def lambda_handler(event, context):
    method = (
        event.get("requestContext", {})
        .get("http", {})
        .get("method", "")
    )

    path_parameters = event.get("pathParameters") or {}
    asset_id = path_parameters.get("assetId")

    # GET /assets/{assetId}
    if method == "GET" and asset_id:
        result = table.get_item(
            Key={"assetId": asset_id}
        )

        asset = result.get("Item")

        if not asset:
            return create_response(
                404,
                {"message": "Asset not found"}
            )

        return create_response(200, asset)

    # GET /assets
    if method == "GET":
        result = table.scan()
        assets = result.get("Items", [])

        return create_response(
            200,
            {
                "count": len(assets),
                "assets": assets
            }
        )

    # POST /assets
    if method == "POST":
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return create_response(
                400,
                {"message": "Invalid JSON body"}
            )

        name = body.get("name")
        asset_type = body.get("type")

        if not name or not asset_type:
            return create_response(
                400,
                {"message": "name and type are required"}
            )

        if asset_type not in VALID_TYPES:
            return create_response(
                400,
                {"message": "Invalid asset type"}
            )

        status = body.get("status", "available")

        if status not in VALID_STATUSES:
            return create_response(
                400,
                {"message": "Invalid asset status"}
            )

        now = datetime.now(timezone.utc).isoformat()

        asset = {
            "assetId": f"AST-{uuid.uuid4().hex[:8].upper()}",
            "name": name,
            "type": asset_type,
            "manufacturer": body.get("manufacturer", ""),
            "model": body.get("model", ""),
            "serialNumber": body.get("serialNumber", ""),
            "status": status,
            "assignedTo": body.get("assignedTo", "unassigned"),
            "department": body.get("department", ""),
            "createdAt": now,
            "updatedAt": now
        }

        table.put_item(Item=asset)

        return create_response(201, asset)

    # PUT /assets/{assetId}
    if method == "PUT" and asset_id:
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return create_response(
                400,
                {"message": "Invalid JSON body"}
            )

        if "type" in body and body["type"] not in VALID_TYPES:
            return create_response(
                400,
                {"message": "Invalid asset type"}
            )

        if "status" in body and body["status"] not in VALID_STATUSES:
            return create_response(
                400,
                {"message": "Invalid asset status"}
            )

        allowed_fields = [
            "name",
            "type",
            "manufacturer",
            "model",
            "serialNumber",
            "status",
            "assignedTo",
            "department"
        ]

        updates = {
            field: body[field]
            for field in allowed_fields
            if field in body
        }

        if not updates:
            return create_response(
                400,
                {"message": "No valid fields provided for update"}
            )

        updates["updatedAt"] = datetime.now(
            timezone.utc
        ).isoformat()

        expressions = []
        attribute_names = {}
        attribute_values = {}

        for index, (field, value) in enumerate(updates.items()):
            name_key = f"#field{index}"
            value_key = f":value{index}"

            attribute_names[name_key] = field
            attribute_values[value_key] = value

            expressions.append(
                f"{name_key} = {value_key}"
            )

        try:
            result = table.update_item(
                Key={"assetId": asset_id},
                UpdateExpression="SET " + ", ".join(expressions),
                ExpressionAttributeNames=attribute_names,
                ExpressionAttributeValues=attribute_values,
                ConditionExpression="attribute_exists(assetId)",
                ReturnValues="ALL_NEW"
            )

        except ClientError as error:
            if (
                error.response["Error"]["Code"]
                == "ConditionalCheckFailedException"
            ):
                return create_response(
                    404,
                    {"message": "Asset not found"}
                )

            raise

        return create_response(
            200,
            result["Attributes"]
        )

    # DELETE /assets/{assetId}
    if method == "DELETE" and asset_id:
        result = table.delete_item(
            Key={"assetId": asset_id},
            ReturnValues="ALL_OLD"
        )

        deleted_asset = result.get("Attributes")

        if not deleted_asset:
            return create_response(
                404,
                {"message": "Asset not found"}
            )

        return create_response(
            200,
            {
                "message": "Asset deleted",
                "asset": deleted_asset
            }
        )

    return create_response(
        405,
        {"message": "Method not allowed"}
    )