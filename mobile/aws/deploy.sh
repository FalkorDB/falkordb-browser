#!/bin/sh
# Deploys (or updates) the FalkorDB Browser server the mobile app points at.
#
#   STACK_NAME=falkordb-browser \
#   BROWSER_URL=https://browser.example.com \
#   CERTIFICATE_ARN=arn:aws:acm:... \
#   VPC_ID=vpc-... SUBNET_IDS=subnet-a,subnet-b \
#   sh aws/deploy.sh
#
# Secrets are generated only when the stack does not exist yet. On updates they
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
# Optional: falkor[s]://user:pass@host:port of a FalkorDB that keeps API tokens,
# so they survive task replacements. Left unset, an existing stack keeps what
# it has (so a rerun never drops it by accident); "none" switches it off.
: "${TOKEN_STORAGE_URL:=}"

TEMPLATE="$(dirname "$0")/browser-service.yml"
WORK="$(mktemp -d)"
chmod 700 "$WORK"
trap 'rm -rf "$WORK"' EXIT INT TERM

# --- Is there a stack already? Only a definite "does not exist" means create.
if STATUS="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" \
    --query "Stacks[0].StackStatus" --output text 2>"$WORK/err")"; then
  :
elif grep -q "does not exist" "$WORK/err"; then
  STATUS=NONE
else
  cat "$WORK/err" >&2
  echo "Could not tell whether $STACK_NAME exists; nothing was changed." >&2
  exit 1
fi

case "$STATUS" in
  NONE) ;;
  *_IN_PROGRESS)
    echo "$STACK_NAME is busy ($STATUS); try again when it settles." >&2
    exit 1 ;;
  ROLLBACK_COMPLETE | ROLLBACK_FAILED | CREATE_FAILED | DELETE_FAILED)
    echo "$STACK_NAME is $STATUS and cannot be updated. Delete it" >&2
    echo "(aws cloudformation delete-stack --stack-name $STACK_NAME), then run this again." >&2
    exit 1 ;;
esac

# --- The token store this stack uses now, read before deploying (the parameter
# is NoEcho, so the stack itself will not say). Only a change to an existing
# URL needs a restart: adding or removing one changes the task definition, so
# CloudFormation replaces the tasks by itself.
PREVIOUS_TOKEN_STORAGE_URL=""
if [ "$STATUS" != NONE ] && [ -n "$TOKEN_STORAGE_URL" ] && [ "$TOKEN_STORAGE_URL" != none ]; then
  token_secret="$(aws cloudformation describe-stack-resource --stack-name "$STACK_NAME" \
    --logical-resource-id TokenStorageSecret \
    --query StackResourceDetail.PhysicalResourceId --output text 2>/dev/null || true)"
  if [ -n "$token_secret" ] && [ "$token_secret" != None ]; then
    PREVIOUS_TOKEN_STORAGE_URL="$(aws secretsmanager get-secret-value --secret-id "$token_secret" \
      --query SecretString --output text 2>/dev/null || true)"
  fi
fi

# --- Parameters go through a private file, so no secret is ever in argv.
json_escape() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }
params="$WORK/params.json"
: > "$params"
chmod 600 "$params"
add() { printf '%s"%s=%s"' "$([ -s "$params" ] && echo ,)" "$1" "$(json_escape "$2")" >> "$params"; }

add BrowserUrl "$BROWSER_URL"
add CertificateArn "$CERTIFICATE_ARN"
add VpcId "$VPC_ID"
add SubnetIds "$SUBNET_IDS"
add ImageUri "$IMAGE_URI"
add AndroidAppUrl "$ANDROID_APP_URL"
add IosAppUrl "$IOS_APP_URL"
case "$TOKEN_STORAGE_URL" in
  "") ;;
  none) add TokenStorageUrl "" ;;
  *) add TokenStorageUrl "$TOKEN_STORAGE_URL" ;;
esac

if [ "$STATUS" = NONE ]; then
  echo "Creating $STACK_NAME with newly generated secrets."
  add AuthSecret "$(openssl rand -hex 32)"
  add EncryptionKey "$(openssl rand -hex 32)"
fi

printf '[%s]\n' "$(cat "$params")" > "$params.tmp" && mv "$params.tmp" "$params"

aws cloudformation deploy \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides "file://$params"

# ECS reads secrets when a task starts, and a changed token-store URL keeps the
# same secret ARN, so tasks already running would go on using the old one.
if [ -n "$PREVIOUS_TOKEN_STORAGE_URL" ] && [ "$PREVIOUS_TOKEN_STORAGE_URL" != "$TOKEN_STORAGE_URL" ]; then
  echo "Restarting the browser so it picks up the token store setting."
  aws ecs update-service \
    --cluster "$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='ClusterName'].OutputValue" --output text)" \
    --service "$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='ServiceName'].OutputValue" --output text)" \
    --force-new-deployment > /dev/null
fi

aws cloudformation describe-stacks --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs" --output table
