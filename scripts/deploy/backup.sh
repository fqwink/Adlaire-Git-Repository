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
REMOTE_ENV_FILE="${REMOTE_ENV_FILE:-$APP_ROOT/shared/config/adlaire.env}"
REMOTE_DATABASE_PATH="${REMOTE_DATABASE_PATH:-$APP_ROOT/shared/data/database/adlaire.sqlite3}"
REMOTE_REPOSITORY_ROOT="${REMOTE_REPOSITORY_ROOT:-$APP_ROOT/shared/data/repositories}"

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
timestamp=\$(date +%Y%m%d-%H%M%S)
backup_dir="$APP_ROOT/shared/backups/\$timestamp"
mkdir -p "\$backup_dir/database" "\$backup_dir/repositories" "\$backup_dir/config" "\$backup_dir/release"

if [ -f "$REMOTE_DATABASE_PATH" ]; then
  sqlite3 "$REMOTE_DATABASE_PATH" ".backup '\$backup_dir/database/adlaire.sqlite3'"
fi

if [ -d "$REMOTE_REPOSITORY_ROOT" ]; then
  tar -C "$REMOTE_REPOSITORY_ROOT" -czf "\$backup_dir/repositories/repositories.tar.gz" .
fi

if [ -f "$REMOTE_ENV_FILE" ]; then
  cp "$REMOTE_ENV_FILE" "\$backup_dir/config/"
fi

if [ -L "$APP_ROOT/current" ] || [ -d "$APP_ROOT/current" ]; then
  current_target=\$(readlink "$APP_ROOT/current" 2>/dev/null || printf '%s' "$APP_ROOT/current")
  printf '%s\n' "\$current_target" > "\$backup_dir/release/current-target.txt"
  tar -C "$APP_ROOT" -czf "\$backup_dir/release/current-release.tar.gz" current
fi

cat > "\$backup_dir/backup-manifest.txt" <<MANIFEST
timestamp=\$timestamp
service=$SERVICE_NAME
app_root=$APP_ROOT
database=$REMOTE_DATABASE_PATH
repositories=$REMOTE_REPOSITORY_ROOT
MANIFEST

printf '%s\n' "\$backup_dir"
EOF
