#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
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
RELEASE_VERSION="${RELEASE_VERSION:-v.1.9}"
ARTIFACT_PATH="${ARTIFACT_PATH:-$ROOT_DIR/dist/adlaire-git-repo}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8080/health}"
RELEASES_DIR="${RELEASES_DIR:-$SYSTEM_ROOT/releases}"
CURRENT_LINK="${CURRENT_LINK:-$SYSTEM_ROOT/current}"
DEPLOY_LOG="${DEPLOY_LOG:-$SHARED_ROOT/logs/deploy.log}"
MANIFEST_ROOT="${MANIFEST_ROOT:-$SHARED_ROOT/manifests}"

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

sha256_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
    return
  fi
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
    return
  fi
  echo "missing required checksum command: sha256sum or shasum" >&2
  exit 1
}

require_value DEPLOY_HOST
require_value DEPLOY_USER

if [ ! -f "$ARTIFACT_PATH" ]; then
  echo "missing deploy artifact: $ARTIFACT_PATH" >&2
  exit 1
fi

"$SCRIPT_DIR/verify-server.sh"
backup_dir=$("$SCRIPT_DIR/backup.sh")

release_id="$RELEASE_VERSION-$(date +%Y%m%d-%H%M%S)"
remote_release_dir="$RELEASES_DIR/$release_id"
remote_manifest="$MANIFEST_ROOT/$release_id.manifest"
local_checksum=$(sha256_file "$ARTIFACT_PATH")

remote_sh sh -eu <<EOF
mkdir -p "$remote_release_dir" "$MANIFEST_ROOT"
EOF

scp -P "$DEPLOY_PORT" "$ARTIFACT_PATH" "$(ssh_target):$remote_release_dir/adlaire-git-repository"

remote_sh sh -eu <<EOF
chmod 0755 "$remote_release_dir/adlaire-git-repository"
if command -v sha256sum >/dev/null 2>&1; then
  remote_checksum=\$(sha256sum "$remote_release_dir/adlaire-git-repository" | awk '{print \$1}')
else
  remote_checksum=\$(shasum -a 256 "$remote_release_dir/adlaire-git-repository" | awk '{print \$1}')
fi
if [ "\$remote_checksum" != "$local_checksum" ]; then
  echo "checksum mismatch after upload" >&2
  exit 1
fi

cat > "$remote_manifest" <<MANIFEST
release_id=$release_id
release_version=$RELEASE_VERSION
artifact=adlaire-git-repository
checksum=$local_checksum
backup_dir=$backup_dir
health_url=$HEALTH_URL
system_root=$SYSTEM_ROOT
shared_root=$SHARED_ROOT
current_link=$CURRENT_LINK
release_dir=$remote_release_dir
MANIFEST

ln -sfn "$remote_release_dir" "$CURRENT_LINK"
systemctl restart "$SERVICE_NAME"
EOF

"$SCRIPT_DIR/verify-release.sh"

remote_sh sh -eu <<EOF
printf '%s %s %s\n' "\$(date +%Y-%m-%dT%H:%M:%S%z)" "$release_id" "$backup_dir" >> "$DEPLOY_LOG"
EOF

echo "deploy-ok: $release_id"
