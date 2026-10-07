#!/bin/sh
# Deploys (or updates) the FalkorDB Browser server the mobile app points at.
#
#   STACK_NAME=falkordb-browser \
#   BROWSER_URL=https://browser.example.com \
#   CERTIFICATE_ARN=arn:aws:acm:... \
#   VPC_ID=vpc-... SUBNET_IDS=subnet-a,subnet-b \
#   sh aws/deploy.sh
#
# Secrets are generated only when the stack is first created. On updates they
# are left out, so CloudFormation keeps the previous values: new ones would
# sign every user out and make stored credentials unreadable.
set -eu

: "${STACK_NAME:=falkordb-browser}"
: "${BROWSER_URL:?set BROWSER_URL (https://...)}"
: "${CERTIFICATE_ARN:?set CERTIFICATE_ARN}"
: "${VPC_ID:?set VPC_ID}"
: "${SUBNET_IDS:?set SUBNET_IDS (comma-separated, at least two AZs)}"
: "${IMAGE_URI:=docker.io/falkordb/falkordb-browser:latest}"
# Optional: what the browser's "Get the app" offers phone visitors.
: "${ANDROID_APP_URL:=}"
: "${IOS_APP_URL:=}"

TEMPLATE="$(dirname "$0")/browser-service.yml"

set -- \
  "BrowserUrl=$BROWSER_URL" \
  "CertificateArn=$CERTIFICATE_ARN" \
  "VpcId=$VPC_ID" \
  "SubnetIds=$SUBNET_IDS" \
  "ImageUri=$IMAGE_URI" \
  "AndroidAppUrl=$ANDROID_APP_URL" \
  "IosAppUrl=$IOS_APP_URL"

if ! aws cloudformation describe-stacks --stack-name "$STACK_NAME" >/dev/null 2>&1; then
  echo "Creating $STACK_NAME with newly generated secrets."
  set -- "$@" \
    "AuthSecret=$(openssl rand -hex 32)" \
    "EncryptionKey=$(openssl rand -hex 32)"
fi

aws cloudformation deploy \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides "$@"

aws cloudformation describe-stacks --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs" --output table
