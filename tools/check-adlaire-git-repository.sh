#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

TMP_REL=".check-work/adlaire-git-repository-check-$$"
TMP_DIR="${CHECK_TMP_DIR:-$ROOT_DIR/$TMP_REL}"
BIN_PATH="$TMP_DIR/adlaire-git-repo"

cleanup() {
  rm -rf "$TMP_DIR"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "missing required command: $1" >&2
    exit 1
  fi
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
    tools/check-adlaire-git-repository.sh \
    scripts/deploy/deploy.env.example \
    scripts/deploy/deploy.sh \
    scripts/deploy/rollback.sh \
    scripts/deploy/backup.sh \
    scripts/deploy/verify-server.sh \
    scripts/deploy/verify-release.sh \
    scripts/docker/deno.sh \
    scripts/docker/verify-build.sh \
    dist/.gitkeep \
    docs/policies/DEVELOPMENT_POLICY_RULEBOOK.md \
    docs/policies/DOCUMENT_CHARTER.md \
    docs/policies/TECHNICAL_REQUIREMENTS_POLICY.md \
    docs/policies/VERSION_POLICY.md \
    docs/policies/RELEASE_POLICY.md \
    docs/policies/DEPLOYMENT_POLICY.md \
    docs/policies/TEST_POLICY.md \
    docs/policies/LICENSE_POLICY.md \
    docs/specs/Auris_System_Design.md \
    docs/specs/Adlaire_Git_Repository_Specification.md \
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

check_forbidden_production_docker_artifacts() {
  if find "$ROOT_DIR" \
    -path "$ROOT_DIR/.git" -prune -o \
    -path "$ROOT_DIR/.check-work" -prune -o \
    \( -name 'Dockerfile' -o -name '.dockerignore' -o -name 'docker-compose.yml' -o -name 'docker-compose.yaml' -o -name 'compose.yaml' \) \
    -print | grep . >/dev/null 2>&1; then
    echo "Adlaire Git Repository must not include production Docker artifacts." >&2
    exit 1
  fi
}

check_version_policy() {
  version=$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' deno.json | sed -n '1p')
  if [ -z "$version" ]; then
    echo "deno.json must define version." >&2
    exit 1
  fi

  major_version=${version%%.*}
  remainder=${version#*.}
  minor_version=${remainder%%.*}
  patch_version=${version##*.}
  case "$major_version$minor_version$patch_version" in
    ''|*[!0-9]*)
      echo "deno.json version must use numeric Major.Minor.Patch: $version" >&2
      exit 1
      ;;
  esac
  if [ "$patch_version" != "0" ]; then
    echo "deno.json patch version must remain 0 for formal v.<major>.<minor> mapping: $version" >&2
    exit 1
  fi

  formal_version="v.$major_version.$minor_version"
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

  if ! grep -F '"compile:linux-arm64": "deno compile --target aarch64-unknown-linux-gnu --allow-net --allow-read --allow-write --allow-env --allow-run --output=dist/adlaire-git-repo-v1.8-aarch64-unknown-linux-gnu src/main.ts"' deno.json >/dev/null 2>&1; then
    echo "deno.json must define the Linux ARM64 release compile task." >&2
    exit 1
  fi

  if ! grep -F '"compile:linux-x86_64": "deno compile --target x86_64-unknown-linux-gnu --allow-net --allow-read --allow-write --allow-env --allow-run --output=dist/adlaire-git-repo-v1.8-x86_64-unknown-linux-gnu src/main.ts"' deno.json >/dev/null 2>&1; then
    echo "deno.json must define the Linux x86_64 release compile task." >&2
    exit 1
  fi

  if ! grep -F '"compile:release": "deno task compile:linux-arm64 && deno task compile:linux-x86_64"' deno.json >/dev/null 2>&1; then
    echo "deno.json must define the release compile task." >&2
    exit 1
  fi

  if ! grep -F '"docker:verify-build": "sh scripts/docker/verify-build.sh"' deno.json >/dev/null 2>&1; then
    echo "deno.json must define the Docker verify build task." >&2
    exit 1
  fi
}

trap cleanup EXIT INT HUP TERM

run_step "required path check" check_required_paths
run_step "version policy check" check_version_policy
run_step "forbidden production Docker artifact check" check_forbidden_production_docker_artifacts
run_step "forbidden Node.js project file check" check_forbidden_node_files
run_step "forbidden unapproved registry dependency check" check_forbidden_unapproved_registries
run_step "deno task definition check" check_deno_tasks

run_step "deploy script syntax check" \
  sh -n scripts/deploy/deploy.sh
run_step "rollback script syntax check" \
  sh -n scripts/deploy/rollback.sh
run_step "backup script syntax check" \
  sh -n scripts/deploy/backup.sh
run_step "server verification script syntax check" \
  sh -n scripts/deploy/verify-server.sh
run_step "release verification script syntax check" \
  sh -n scripts/deploy/verify-release.sh
run_step "docker Deno wrapper syntax check" \
  sh -n scripts/docker/deno.sh
run_step "docker verify build script syntax check" \
  sh -n scripts/docker/verify-build.sh

require_command deno
require_command git
require_command sqlite3

mkdir -p "$TMP_DIR"

run_step "deno fmt --check" \
  deno fmt --check deno.json src/ tests/

run_step "deno lint" \
  deno lint

run_step "deno test" \
  deno test --allow-net=127.0.0.1,localhost --allow-read --allow-write --allow-env --allow-run tests/

run_step "deno compile" \
  deno compile \
    --allow-net \
    --allow-read \
    --allow-write \
    --allow-env \
    --allow-run \
    --output="$BIN_PATH" \
    src/main.ts

echo "adlaire-git-repository-check-ok"
