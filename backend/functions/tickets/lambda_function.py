import json
import os
import uuid
from datetime import datetime, timezone

import boto3



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

    path_parameters = event.get("pathParameters") or {}

    if method == "GET" and "ticketId" in path_parameters:
        ticket_id = path_parameters["ticketId"]

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

    return create_response(
        405,
        {"message": "Method not allowed"}
    )