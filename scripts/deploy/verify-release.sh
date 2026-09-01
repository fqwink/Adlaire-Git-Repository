#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ENV_FILE="${DEPLOY_ENV_FILE:-$SCRIPT_DIR/deploy.env}"

if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  . "$ENV_FILE"
fi

DEPLOY_PORT="${DEPLOY_PORT:-22}"
APP_ROOT="${APP_ROOT:-/opt/adlaire-git-repository}"
SYSTEM_ROOT="${SYSTEM_ROOT:-$APP_ROOT/system}"
SHARED_ROOT="${SHARED_ROOT:-$APP_ROOT/shared}"
SERVICE_NAME="${SERVICE_NAME:-adlaire-git-repository}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8080/health}"
CURRENT_LINK="${CURRENT_LINK:-$SYSTEM_ROOT/current}"
MANIFEST_ROOT="${MANIFEST_ROOT:-$SHARED_ROOT/manifests}"
REMOTE_DATABASE_PATH="${REMOTE_DATABASE_PATH:-$SHARED_ROOT/data/database/adlaire.libsql}"
REMOTE_REPOSITORY_ROOT="${REMOTE_REPOSITORY_ROOT:-$SHARED_ROOT/data/repositories}"
REMOTE_LOG_DIR="${REMOTE_LOG_DIR:-$SHARED_ROOT/logs}"

require_value() {
  name="$1"
  eval "value=\${$name:-}"
  if [ -z "$value" ]; then
    echo "missing required deploy setting: $name" >&2
    exit 1
  fi
}

ssh_target() {
  printf '%s@%s' "$DEPLOY_USER" "$DEPLOY_HOST"
}

remote_sh() {
  ssh -p "$DEPLOY_PORT" "$(ssh_target)" "$@"
}

require_value DEPLOY_HOST
require_value DEPLOY_USER

remote_sh sh -eu <<EOF
if [ ! -x "$CURRENT_LINK/adlaire-git-repository" ]; then
  echo "missing executable current binary" >&2
  exit 1
fi

systemctl is-active --quiet "$SERVICE_NAME"
curl -fsS "$HEALTH_URL" >/dev/null

if [ ! -f "$REMOTE_DATABASE_PATH" ]; then
  echo "missing database: $REMOTE_DATABASE_PATH" >&2
  exit 1
fi

if [ ! -d "$REMOTE_REPOSITORY_ROOT" ]; then
  echo "missing repository root: $REMOTE_REPOSITORY_ROOT" >&2
  exit 1
fi

if [ ! -d "$REMOTE_LOG_DIR" ]; then
  echo "missing log directory: $REMOTE_LOG_DIR" >&2
  exit 1
fi

if [ ! -d "$MANIFEST_ROOT" ]; then
  echo "missing manifest directory: $MANIFEST_ROOT" >&2
  exit 1
fi

echo "deploy-release-verify-ok"
EOF
