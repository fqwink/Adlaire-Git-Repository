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
TARGET_RELEASE="${TARGET_RELEASE:-}"

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
require_value TARGET_RELEASE

remote_sh sh -eu <<EOF
target="$APP_ROOT/releases/$TARGET_RELEASE"
if [ ! -d "\$target" ]; then
  echo "missing target release: \$target" >&2
  exit 1
fi

if [ ! -x "\$target/adlaire-git-repository" ]; then
  echo "target release does not contain executable binary" >&2
  exit 1
fi

ln -sfn "\$target" "$APP_ROOT/current"
systemctl restart "$SERVICE_NAME"
printf '%s rollback %s\n' "\$(date +%Y-%m-%dT%H:%M:%S%z)" "$TARGET_RELEASE" >> "$APP_ROOT/deploy/deploy.log"
EOF

"$SCRIPT_DIR/verify-release.sh"

echo "rollback-ok: $TARGET_RELEASE"
