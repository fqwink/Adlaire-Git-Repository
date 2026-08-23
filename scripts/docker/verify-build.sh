#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
IMAGE="${ADLAIRE_DENO_DOCKER_IMAGE:-denoland/deno:2.9.5}"
CACHE_DIR="${ADLAIRE_DENO_DOCKER_CACHE:-$ROOT_DIR/.check-work/deno-cache}"
DOCKER_BIN="${ADLAIRE_DOCKER_BIN:-}"

mkdir -p "$CACHE_DIR"

if [ -z "$DOCKER_BIN" ]; then
  if command -v docker >/dev/null 2>&1; then
    DOCKER_BIN=$(command -v docker)
  elif [ -x /Applications/Docker.app/Contents/Resources/bin/docker ]; then
    DOCKER_BIN=/Applications/Docker.app/Contents/Resources/bin/docker
  else
    echo "missing required command: docker" >&2
    exit 1
  fi
fi

PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH" exec "$DOCKER_BIN" run --rm \
  --user root \
  --entrypoint sh \
  -v "$ROOT_DIR:/workspace" \
  -v "$CACHE_DIR:/deno-dir" \
  -w /workspace \
  -e DENO_DIR=/deno-dir \
  "$IMAGE" -eu -c '
    if ! command -v sqlite3 >/dev/null 2>&1 || ! command -v git >/dev/null 2>&1; then
      apt-get update
      apt-get install -y --no-install-recommends sqlite3 git ca-certificates
      rm -rf /var/lib/apt/lists/*
    fi

    deno task fmt
    deno task lint
    deno task test
    deno task compile
    deno task compile:release

    echo "docker-verify-build-ok"
  '
