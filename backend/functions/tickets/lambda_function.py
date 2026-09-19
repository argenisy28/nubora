import json
import os
import uuid
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TICKETS_TABLE"])


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

    groups = get_user_groups(event)

    if not is_authorized(method, groups):
        return create_response(
            403,
            {"message": "Forbidden"}
        )

    path_parameters = event.get("pathParameters") or {}
    ticket_id = path_parameters.get("ticketId")

    # GET /tickets/{ticketId}
    if method == "GET" and ticket_id:
        result = table.get_item(
            Key={"ticketId": ticket_id}
        )

        ticket = result.get("Item")

        if not ticket:
            return create_response(
                404,
                {"message": "Ticket not found"}
            )

        return create_response(200, ticket)

    # GET /tickets
    if method == "GET":
        result = table.scan()
        tickets = result.get("Items", [])

        return create_response(
            200,
            {
                "count": len(tickets),
                "tickets": tickets
            }
        )

    # POST /tickets
    if method == "POST":
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return create_response(
                400,
                {"message": "Invalid JSON body"}
            )

        title = body.get("title")
        description = body.get("description")

        if not title or not description:
            return create_response(
                400,
                {"message": "title and description are required"}
            )

        now = datetime.now(timezone.utc).isoformat()

        ticket = {
            "ticketId": f"TKT-{uuid.uuid4().hex[:8].upper()}",
            "title": title,
            "description": description,
            "priority": body.get("priority", "medium"),
            "status": "open",
            "createdBy": body.get("createdBy", "demo-user"),
            "assignedTo": "unassigned",
            "createdAt": now,
            "updatedAt": now
        }

        table.put_item(Item=ticket)

        return create_response(201, ticket)

    # PUT /tickets/{ticketId}
    if method == "PUT" and ticket_id:
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return create_response(
                400,
                {"message": "Invalid JSON body"}
            )

        allowed_fields = [
            "title",
            "description",
            "priority",
            "status",
            "assignedTo"
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
                Key={"ticketId": ticket_id},
                UpdateExpression="SET " + ", ".join(expressions),
                ExpressionAttributeNames=attribute_names,
                ExpressionAttributeValues=attribute_values,
                ConditionExpression="attribute_exists(ticketId)",
                ReturnValues="ALL_NEW"
            )
        except ClientError as error:
            if (
                error.response["Error"]["Code"]
                == "ConditionalCheckFailedException"
            ):
                return create_response(
                    404,
                    {"message": "Ticket not found"}
                )

            raise

        return create_response(
            200,
            result["Attributes"]
        )

    # DELETE /tickets/{ticketId}
    if method == "DELETE" and ticket_id:
        result = table.delete_item(
            Key={"ticketId": ticket_id},
            ReturnValues="ALL_OLD"
        )

        deleted_ticket = result.get("Attributes")

        if not deleted_ticket:
            return create_response(
                404,
                {"message": "Ticket not found"}
            )

        return create_response(
            200,
            {
                "message": "Ticket deleted",
                "ticket": deleted_ticket
            }
        )

    return create_response(
        405,
        {"message": "Method not allowed"}
    )

def get_user_groups(event):
    claims = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
    )

    groups = claims.get("cognito:groups", [])

    if isinstance(groups, list):
        return set(groups)

    if isinstance(groups, str):
        try:
            parsed_groups = json.loads(groups)

            if isinstance(parsed_groups, list):
                return set(parsed_groups)

        except json.JSONDecodeError:
            pass

        return {
            group.strip().strip('"')
            for group in groups.strip("[]").split(",")
            if group.strip()
        }

    return set()


def is_authorized(method, groups):
    if "Admins" in groups:
        return True

    if "Technicians" in groups:
        return method in {"GET", "POST", "PUT"}

    if "Viewers" in groups:
        return method == "GET"

    return False