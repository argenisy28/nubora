$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Loading Nubora development environment..."
Write-Host ""

# --------------------------------------------------
# AWS session verification
# --------------------------------------------------

Write-Host "Checking AWS authentication..."

$Identity = aws sts get-caller-identity --output json | ConvertFrom-Json

if (-not $Identity.Account) {
    throw "AWS authentication failed. Run 'aws login' and try again."
}

$AwsAccountId = $Identity.Account
$AwsRegion = aws configure get region

Write-Host "AWS authentication OK"
Write-Host "Region: $AwsRegion"


# --------------------------------------------------
# API Gateway
# --------------------------------------------------

Write-Host ""
Write-Host "Loading Nubora API..."

$ApiId = aws apigatewayv2 get-apis `
    --query "Items[?Name=='nubora-dev-api'].ApiId | [0]" `
    --output text

if (-not $ApiId -or $ApiId -eq "None") {
    throw "Could not find nubora-dev-api."
}

$ApiEndpoint = aws apigatewayv2 get-api `
    --api-id $ApiId `
    --query "ApiEndpoint" `
    --output text


# --------------------------------------------------
# Cognito
# --------------------------------------------------

Write-Host "Loading Cognito configuration..."

$UserPoolId = aws cognito-idp list-user-pools `
    --max-results 60 `
    --query "UserPools[?Name=='nubora-dev-users'].Id | [0]" `
    --output text

if (-not $UserPoolId -or $UserPoolId -eq "None") {
    throw "Could not find nubora-dev-users."
}

$AppClientId = aws cognito-idp list-user-pool-clients `
    --user-pool-id $UserPoolId `
    --query "UserPoolClients[?ClientName=='nubora-web'].ClientId | [0]" `
    --output text

if (-not $AppClientId -or $AppClientId -eq "None") {
    throw "Could not find nubora-web app client."
}


# --------------------------------------------------
# Resource names
# --------------------------------------------------

$TicketsTable = "nubora-dev-tickets"
$AssetsTable = "nubora-dev-assets"

$HealthFunction = "nubora-dev-health"
$TicketsFunction = "nubora-dev-tickets"
$AssetsFunction = "nubora-dev-assets"


# --------------------------------------------------
# Summary
# --------------------------------------------------

Write-Host ""
Write-Host "Nubora environment loaded successfully."
Write-Host ""
Write-Host "AWS Region:        $AwsRegion"
Write-Host "API ID:            $ApiId"
Write-Host "API Endpoint:      $ApiEndpoint"
Write-Host "Cognito Pool:      $UserPoolId"
Write-Host "App Client:        $AppClientId"
Write-Host "Tickets Table:     $TicketsTable"
Write-Host "Assets Table:      $AssetsTable"
Write-Host ""
Write-Host "Authentication tokens and passwords are NOT loaded."
Write-Host ""