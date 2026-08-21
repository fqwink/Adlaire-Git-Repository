#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
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

check_required_paths() {
  for path in \
    AGENTS.md \
    README.md \
    deno.json \
    Dockerfile \
    compose.yaml \
    tools/check-adlaire-git-repository.sh \
    dist/.gitkeep \
    docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md \
    docs/policies/DOCUMENT_CHARTER.md \
    docs/policies/TECHNICAL_REQUIREMENTS_POLICY.md \
    docs/policies/VERSION_POLICY.md \
    docs/policies/RELEASE_POLICY.md \
    docs/policies/TEST_POLICY.md \
    docs/policies/LICENSE_POLICY.md \
    docs/specs/Auris_System_Design.md \
    docs/specs/Adlaire_Git_Repository_Specification.md \
    docs/specs/WYSIWYG_Editor_Specification.md \
    docs/plans/DEVELOPMENT_PLAN.md \
    docs/plans/MASTER_IMPLEMENTATION_FEATURE_CANDIDATES.md \
    src/main.ts \
    src/server.ts \
    src/config.ts \
    src/domain/issue.ts \
    src/domain/phase2.ts \
    src/database/types.ts \
    src/database/gateway.ts \
    src/database/sql.ts \
    src/database/sqlite_cli_driver.ts \
    src/database/schema.sql \
    src/repositories/issue_repository.ts \
    src/repositories/phase2_repository.ts \
    src/services/issue_service.ts \
    src/services/phase2_service.ts \
    tests/support/assert.ts \
    tests/unit/auth_service_test.ts \
    tests/unit/git_http_backend_test.ts \
    tests/unit/issue_service_test.ts \
    tests/unit/repository_name_test.ts \
    tests/unit/repository_path_test.ts \
    tests/integration/issue_api_test.ts \
    tests/integration/phase2_api_test.ts \
    tests/integration/repository_service_test.ts; do
    if [ ! -f "$ROOT_DIR/$path" ]; then
      echo "missing Adlaire Git Repository required path: $path" >&2
      exit 1
    fi
  done
}

check_version_policy() {
  version=$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' deno.json | sed -n '1p')
  if [ -z "$version" ]; then
    echo "deno.json must define version." >&2
    exit 1
  fi

  case "$version" in
    0.*.0) ;;
    *)
      echo "pre-stable deno.json version must use 0.<minor>.0: $version" >&2
      exit 1
      ;;
  esac

  minor_version=${version#0.}
  minor_version=${minor_version%.0}
  case "$minor_version" in
    ''|*[!0-9]*)
      echo "pre-stable deno.json minor version must be numeric: $version" >&2
      exit 1
      ;;
  esac

  formal_version="v.0.$minor_version"
  if ! grep -F "**現行フェーズ基準バージョン**: $formal_version" docs/plans/DEVELOPMENT_PLAN.md >/dev/null 2>&1; then
    echo "deno.json version must match current phase baseline in DEVELOPMENT_PLAN.md: $formal_version" >&2
    exit 1
  fi
}

check_forbidden_node_files() {
  if find "$ROOT_DIR" \
    -path "$ROOT_DIR/.git" -prune -o \
    -path "$ROOT_DIR/.check-work" -prune -o \
    \( -name 'package.json' -o -name 'package-lock.json' -o -name 'node_modules' -o -name 'tsconfig.json' \) \
    -print | grep . >/dev/null 2>&1; then
    echo "Adlaire Git Repository must not use Node.js/npm project files." >&2
    exit 1
  fi
}

check_forbidden_unapproved_registries() {
  if grep -R -n -E '["'\''](jsr|npm):' "$ROOT_DIR/src" "$ROOT_DIR/tests" "$ROOT_DIR/deno.json" >/dev/null 2>&1; then
    echo "JSR/npm registry dependencies are not allowed without explicit approval and policy updates." >&2
    exit 1
  fi
}

check_deno_tasks() {
  if ! grep -F '"fmt": "deno fmt deno.json src/ tests/"' deno.json >/dev/null 2>&1; then
    echo "deno.json must define the fmt task." >&2
    exit 1
  fi

  if ! grep -F '"lint": "deno lint"' deno.json >/dev/null 2>&1; then
    echo "deno.json must define the lint task." >&2
    exit 1
  fi

  if ! grep -F '"test": "deno test --allow-net=127.0.0.1,localhost --allow-read --allow-write --allow-env --allow-run tests/"' deno.json >/dev/null 2>&1; then
    echo "deno.json must define the test task." >&2
    exit 1
  fi

  if ! grep -F '"compile": "deno compile --allow-net --allow-read --allow-write --allow-env --allow-run --output=dist/adlaire-git-repo src/main.ts"' deno.json >/dev/null 2>&1; then
    echo "deno.json must define the compile task." >&2
    exit 1
  fi
}

trap cleanup EXIT INT HUP TERM

run_step "required path check" check_required_paths
run_step "version policy check" check_version_policy
run_step "forbidden Node.js project file check" check_forbidden_node_files
run_step "forbidden unapproved registry dependency check" check_forbidden_unapproved_registries
run_step "deno task definition check" check_deno_tasks

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
  run_deno test --allow-net=127.0.0.1,localhost --allow-read --allow-write --allow-env --allow-run tests/

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
