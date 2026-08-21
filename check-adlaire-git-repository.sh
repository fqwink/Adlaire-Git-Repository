#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$ROOT_DIR"

TMP_REL=".check-work/adlaire-git-repository-check-$$"
TMP_DIR="${CHECK_TMP_DIR:-$ROOT_DIR/$TMP_REL}"
BIN_PATH="$TMP_DIR/adlaire-git-repo"
CONTAINER_BIN_PATH="/app/$TMP_REL/adlaire-git-repo"
DOCKER_IMAGE="${CHECK_DOCKER_IMAGE:-adlaire-git-repository:check}"
USE_DOCKER=0
DOCKER_BIN=""

cleanup() {
  rm -rf "$TMP_DIR"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "missing required command: $1" >&2
    exit 1
  fi
}

find_docker() {
  if command -v docker >/dev/null 2>&1; then
    DOCKER_BIN=$(command -v docker)
    return 0
  fi

  if [ -x /Applications/Docker.app/Contents/Resources/bin/docker ]; then
    DOCKER_BIN=/Applications/Docker.app/Contents/Resources/bin/docker
    return 0
  fi

  return 1
}

prepare_runtime() {
  if command -v deno >/dev/null 2>&1; then
    USE_DOCKER=0
    return
  fi

  if ! find_docker; then
    echo "missing required command: deno" >&2
    echo "docker fallback is also unavailable" >&2
    exit 1
  fi

  USE_DOCKER=1
  echo "==> docker build"
  "$DOCKER_BIN" build -t "$DOCKER_IMAGE" .
}

run_deno() {
  if [ "$USE_DOCKER" -eq 0 ]; then
    deno "$@"
    return
  fi

  "$DOCKER_BIN" run --rm \
    -v "$ROOT_DIR:/app" \
    -w /app \
    -e DENO_DIR=/tmp/deno-dir \
    "$DOCKER_IMAGE" \
    deno "$@"
}

run_step() {
  echo "==> $1"
  shift
  "$@"
}

trap cleanup EXIT INT HUP TERM

prepare_runtime

if [ "$USE_DOCKER" -eq 0 ]; then
  require_command git
  require_command sqlite3
fi

mkdir -p "$TMP_DIR"

run_step "deno fmt --check" \
  run_deno fmt --check deno.json src/ tests/

run_step "deno lint" \
  run_deno lint

run_step "deno test" \
  run_deno test --allow-read --allow-write --allow-env --allow-run tests/

run_step "deno compile" \
  run_deno compile \
    --allow-net \
    --allow-read \
    --allow-write \
    --allow-env \
    --allow-run \
    --output="$([ "$USE_DOCKER" -eq 1 ] && echo "$CONTAINER_BIN_PATH" || echo "$BIN_PATH")" \
    src/main.ts

echo "adlaire-git-repository-check-ok"
