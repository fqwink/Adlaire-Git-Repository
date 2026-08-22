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
SERVICE_NAME="${SERVICE_NAME:-adlaire-git-repository}"

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
require_command() {
  if ! command -v "\$1" >/dev/null 2>&1; then
    echo "missing required command on server: \$1" >&2
    exit 1
  fi
}

require_command sh
require_command tar
require_command ln
require_command mkdir
require_command systemctl
require_command curl
require_command sqlite3
require_command git

if ! command -v sha256sum >/dev/null 2>&1 && ! command -v shasum >/dev/null 2>&1; then
  echo "missing required checksum command on server: sha256sum or shasum" >&2
  exit 1
fi

if [ ! -d "$APP_ROOT" ]; then
  echo "missing app root: $APP_ROOT" >&2
  exit 1
fi

for dir in \
  "$APP_ROOT/releases" \
  "$APP_ROOT/shared/config" \
  "$APP_ROOT/shared/data/database" \
  "$APP_ROOT/shared/data/repositories" \
  "$APP_ROOT/shared/logs" \
  "$APP_ROOT/shared/backups" \
  "$APP_ROOT/deploy"; do
  if [ ! -d "\$dir" ]; then
    echo "missing required directory: \$dir" >&2
    exit 1
  fi
done

systemctl status "$SERVICE_NAME" >/dev/null 2>&1 || true

echo "deploy-server-verify-ok"
EOF
