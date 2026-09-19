# Security Policy

## Reporting Security Issues

If you discover a security issue in Nubora, please do not disclose sensitive information through a public GitHub issue.

This project is developed for educational and portfolio purposes.

## Credential Security

Nubora does not store AWS credentials, API keys, secrets, or other sensitive authentication information in the source code repository.

Sensitive configuration must be provided through approved environment variables, AWS IAM roles, or secret-management mechanisms.

## Authentication and Authorization

Nubora uses Amazon Cognito and Amazon API Gateway JWT authorization to protect application resources.

### Authentication Flow

1. Users authenticate through an Amazon Cognito User Pool.
2. Cognito issues a JWT access token after successful authentication.
3. Clients send the token using the HTTP `Authorization` header.
4. API Gateway validates the JWT before forwarding requests to backend Lambda functions.
5. Lambda functions use the validated Cognito group claims to enforce role-based permissions.

The `/health` endpoint remains public for service health checks. Ticket and asset endpoints require authentication.

### Role-Based Access Control

Nubora currently defines three user roles:

| Role | Read | Create | Update | Delete |
|---|---|---|---|---|
| Admins | Yes | Yes | Yes | Yes |
| Technicians | Yes | Yes | Yes | No |
| Viewers | Yes | No | No | No |

Cognito group membership is provided through the `cognito:groups` claim in validated JWT access tokens.

Requests from authenticated users without sufficient permissions return HTTP `403 Forbidden`.

Requests without valid authentication return HTTP `401 Unauthorized`.

### Protected Resources

Authentication and RBAC are enforced for:

- `/tickets`
- `/tickets/{ticketId}`
- `/assets`
- `/assets/{assetId}`

The following endpoint remains public:

- `/health`

### Security Principles

The current architecture follows several security principles:

- JWT validation occurs at API Gateway before protected requests reach Lambda.
- Passwords and access tokens are never committed to source control.
- Lambda functions use dedicated IAM roles.
- DynamoDB access is restricted to the tables required by each Lambda function.
- Administrative, technician, and read-only privileges are separated through role-based access control.