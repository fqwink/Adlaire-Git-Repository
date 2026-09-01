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
CURRENT_LINK="${CURRENT_LINK:-$SYSTEM_ROOT/current}"
MANIFEST_ROOT="${MANIFEST_ROOT:-$SHARED_ROOT/manifests}"
REMOTE_ENV_FILE="${REMOTE_ENV_FILE:-$SHARED_ROOT/config/adlaire.env}"
REMOTE_DATABASE_PATH="${REMOTE_DATABASE_PATH:-$SHARED_ROOT/data/database/adlaire.libsql}"
REMOTE_REPOSITORY_ROOT="${REMOTE_REPOSITORY_ROOT:-$SHARED_ROOT/data/repositories}"
REMOTE_SECRETS_DIR="${REMOTE_SECRETS_DIR:-$SHARED_ROOT/secrets}"
REMOTE_LOG_DIR="${REMOTE_LOG_DIR:-$SHARED_ROOT/logs}"
REMOTE_BACKUP_ROOT="${REMOTE_BACKUP_ROOT:-$SHARED_ROOT/backups}"

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
backup_dir="$REMOTE_BACKUP_ROOT/\$timestamp"
mkdir -p "\$backup_dir/database" "\$backup_dir/repositories" "\$backup_dir/config" "\$backup_dir/secrets" "\$backup_dir/logs" "\$backup_dir/manifests" "\$backup_dir/system"

service_was_active=no
if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet "$SERVICE_NAME"; then
  service_was_active=yes
  systemctl stop "$SERVICE_NAME"
fi

restart_service_if_needed() {
  if [ "\$service_was_active" = yes ]; then
    systemctl start "$SERVICE_NAME"
  fi
}
trap restart_service_if_needed EXIT HUP INT TERM

if [ -f "$REMOTE_DATABASE_PATH" ]; then
  cp "$REMOTE_DATABASE_PATH" "\$backup_dir/database/"
fi

for suffix in -wal -shm; do
  if [ -f "$REMOTE_DATABASE_PATH\$suffix" ]; then
    cp "$REMOTE_DATABASE_PATH\$suffix" "\$backup_dir/database/"
  fi
done

database_dir=\$(dirname "$REMOTE_DATABASE_PATH")
if [ -d "\$database_dir" ]; then
  find "\$database_dir" -maxdepth 1 -type f -name '*.libsql*' -exec cp {} "\$backup_dir/database/" \;
fi

if [ -d "$REMOTE_REPOSITORY_ROOT" ]; then
  tar -C "$REMOTE_REPOSITORY_ROOT" -czf "\$backup_dir/repositories/repositories.tar.gz" .
fi

if [ -f "$REMOTE_ENV_FILE" ]; then
  cp "$REMOTE_ENV_FILE" "\$backup_dir/config/"
fi

if [ -d "$REMOTE_SECRETS_DIR" ]; then
  tar -C "$REMOTE_SECRETS_DIR" -czf "\$backup_dir/secrets/secrets.tar.gz" .
fi

if [ -d "$REMOTE_LOG_DIR" ]; then
  tar -C "$REMOTE_LOG_DIR" -czf "\$backup_dir/logs/logs.tar.gz" .
fi

if [ -d "$MANIFEST_ROOT" ]; then
  tar -C "$MANIFEST_ROOT" -czf "\$backup_dir/manifests/manifests.tar.gz" .
fi

if [ -L "$CURRENT_LINK" ] || [ -d "$CURRENT_LINK" ]; then
  current_target=\$(readlink "$CURRENT_LINK" 2>/dev/null || printf '%s' "$CURRENT_LINK")
  printf '%s\n' "\$current_target" > "\$backup_dir/system/current-target.txt"
  current_parent=\$(dirname "$CURRENT_LINK")
  current_name=\$(basename "$CURRENT_LINK")
  tar -C "\$current_parent" -czf "\$backup_dir/system/current-release.tar.gz" "\$current_name"
fi

trap - EXIT HUP INT TERM
restart_service_if_needed

cat > "\$backup_dir/backup-manifest.txt" <<MANIFEST
timestamp=\$timestamp
service=$SERVICE_NAME
service_was_active=\$service_was_active
app_root=$APP_ROOT
system_root=$SYSTEM_ROOT
shared_root=$SHARED_ROOT
database=$REMOTE_DATABASE_PATH
repositories=$REMOTE_REPOSITORY_ROOT
config=$REMOTE_ENV_FILE
secrets=$REMOTE_SECRETS_DIR
logs=$REMOTE_LOG_DIR
manifests=$MANIFEST_ROOT
current_link=$CURRENT_LINK
MANIFEST

printf '%s\n' "\$backup_dir"
EOF
