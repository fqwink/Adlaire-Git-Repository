#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

TMP_REL=".check-work/adlaire-git-repository-check-$$"
TMP_DIR="${CHECK_TMP_DIR:-$ROOT_DIR/$TMP_REL}"

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
    deno.lock \
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
    src/database/libsql_driver.ts \
    src/database/sql.ts \
    src/database/sqlite_cli_driver.ts \
    src/database/schema.sql \
    src/repositories/issue_repository.ts \
    src/repositories/phase2_repository.ts \
    src/services/issue_service.ts \
    src/services/phase2_service.ts \
    tests/support/assert.ts \
    tests/unit/auth_service_test.ts \
    tests/unit/config_test.ts \
    tests/unit/git_http_backend_test.ts \
    tests/unit/issue_service_test.ts \
    tests/unit/libsql_driver_test.ts \
    tests/unit/repository_name_test.ts \
    tests/unit/repository_path_test.ts \
    tests/integration/issue_api_test.ts \
    tests/integration/phase2_api_test.ts \
    tests/integration/phase3_api_test.ts \
    tests/integration/phase9_release_judgment_test.ts \
    tests/integration/repository_service_test.ts; do
    if [ ! -f "$ROOT_DIR/$path" ]; then
      echo "missing Adlaire Git Repository required path: $path" >&2
      exit 1
    fi
  done
}

check_docker_standard_policy() {
  docker_artifacts=$(mktemp)
  find "$ROOT_DIR" \
    -path "$ROOT_DIR/.git" -prune -o \
    -path "$ROOT_DIR/.check-work" -prune -o \
    \( -name 'Dockerfile' -o -name 'docker-compose.yml' -o -name 'docker-compose.yaml' -o -name 'compose.yaml' \) \
    -print > "$docker_artifacts"

  if [ -s "$docker_artifacts" ] && xargs grep -E 'node_modules|package.json|npm install|npm:' < "$docker_artifacts" >/dev/null 2>&1; then
    rm -f "$docker_artifacts"
    echo "Docker production artifacts must not depend on Node.js or npm ecosystem." >&2
    exit 1
  fi
  rm -f "$docker_artifacts"
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
      echo "deno.json version must use numeric X.Y.Patch mapping: $version" >&2
      exit 1
      ;;
  esac
  if [ "$patch_version" != "0" ]; then
    echo "deno.json patch version must remain 0 for formal v.X.Y mapping: $version" >&2
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
  if grep -R -n -E '["'\''](jsr|npm):' "$ROOT_DIR/src" "$ROOT_DIR/tests" "$ROOT_DIR/deno.json" "$ROOT_DIR/deno.lock" >/dev/null 2>&1; then
    echo "JSR/npm registry dependencies are not allowed without explicit approval and policy updates." >&2
    exit 1
  fi

  if grep -R -n '@libsql/client' "$ROOT_DIR/src" "$ROOT_DIR/tests" "$ROOT_DIR/deno.json" "$ROOT_DIR/deno.lock" >/dev/null 2>&1; then
    echo "@libsql/client must not be used; libSQL access must stay in the Deno-only internal driver." >&2
    exit 1
  fi

  if grep -R -n -E 'node:|package.json|node_modules|npm ecosystem' "$ROOT_DIR/src" "$ROOT_DIR/tests" "$ROOT_DIR/deno.json" "$ROOT_DIR/deno.lock" >/dev/null 2>&1; then
    echo "runtime and test code must not depend on Node.js/npm ecosystem." >&2
    exit 1
  fi
}

check_forbidden_direct_ffi_usage() {
  if grep -R -n -E 'Deno\.(dlopen|UnsafePointer|UnsafeFnPointer|UnsafeCallback|UnsafePointerView)' "$ROOT_DIR/src" "$ROOT_DIR/tests" >/dev/null 2>&1; then
    echo "direct Deno FFI API usage is not approved." >&2
    exit 1
  fi
}

check_system_data_split_policy() {
  if ! grep -F 'const appRoot = env.get("ADLAIRE_APP_ROOT") ?? ".";' src/config.ts >/dev/null 2>&1; then
    echo "config must derive shared data paths from ADLAIRE_APP_ROOT." >&2
    exit 1
  fi

  if ! grep -F 'const sharedDir = env.get("ADLAIRE_SHARED_DIR") ?? `${appRoot}/shared`;' src/config.ts >/dev/null 2>&1; then
    echo "config must support ADLAIRE_SHARED_DIR for the host filesystem data side." >&2
    exit 1
  fi

  if ! grep -F 'return "http://127.0.0.1:8081";' src/config.ts >/dev/null 2>&1; then
    echo "default libSQL connection must target the local libSQL server endpoint." >&2
    exit 1
  fi

  if grep -R -n -E '\$APP_ROOT/(releases|current|deploy/deploy\.log)' scripts/deploy >/dev/null 2>&1; then
    echo "deploy scripts must use system/current/releases and shared logs, not APP_ROOT direct release paths." >&2
    exit 1
  fi

  if grep -R -n 'shared/repositories' docs README.md scripts src tests >/dev/null 2>&1; then
    echo "repository data must use shared/data/repositories, not shared/repositories." >&2
    exit 1
  fi

  if ! grep -F 'MANIFEST_ROOT=/opt/adlaire-git-repository/shared/manifests' scripts/deploy/deploy.env.example >/dev/null 2>&1; then
    echo "deploy.env.example must define shared manifest storage." >&2
    exit 1
  fi

  if ! grep -F 'resolved_current=' scripts/deploy/backup.sh >/dev/null 2>&1; then
    echo "backup.sh must archive the resolved current release target, not only the current symlink." >&2
    exit 1
  fi

  if grep -R -n 'TARGET_IMAGE=.*scripts/deploy/rollback.sh' README.md docs >/dev/null 2>&1; then
    echo "rollback examples must use TARGET_RELEASE for the current rollback script." >&2
    exit 1
  fi
}

check_legacy_deno_assets() {
  version=$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' deno.json | sed -n '1p')
  major_version=${version%%.*}
  remainder=${version#*.}
  minor_version=${remainder%%.*}
  formal_version="v.$major_version.$minor_version"
  artifact_version="v$major_version.$minor_version"

  if ! grep -F '"dev": "deno run --allow-net --allow-read --allow-write --allow-env --allow-run src/main.ts"' deno.json >/dev/null 2>&1; then
    echo "deno.json must define the dev task." >&2
    exit 1
  fi

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

  if ! grep -F "\"compile:linux-arm64\": \"deno compile --target aarch64-unknown-linux-gnu --allow-net --allow-read --allow-write --allow-env --allow-run --output=dist/adlaire-git-repo-$artifact_version-aarch64-unknown-linux-gnu src/main.ts\"" deno.json >/dev/null 2>&1; then
    echo "deno.json must define the Linux ARM64 release compile task." >&2
    exit 1
  fi

  if ! grep -F "\"compile:linux-x86_64\": \"deno compile --target x86_64-unknown-linux-gnu --allow-net --allow-read --allow-write --allow-env --allow-run --output=dist/adlaire-git-repo-$artifact_version-x86_64-unknown-linux-gnu src/main.ts\"" deno.json >/dev/null 2>&1; then
    echo "deno.json must define the Linux x86_64 release compile task." >&2
    exit 1
  fi

  if ! grep -F "RELEASE_VERSION=\"\${RELEASE_VERSION:-$formal_version}\"" scripts/deploy/deploy.sh >/dev/null 2>&1; then
    echo "deploy.sh default release version must match deno.json formal version: $formal_version" >&2
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

check_go_execution_if_present() {
  if [ ! -f go.mod ]; then
    echo "Go implementation is not present yet; execution checks are deferred to the approved Go implementation phase."
    return 0
  fi

  require_command go

  run_step "go fmt" go fmt ./...
  run_step "go test" go test ./...
  run_step "go build" go build ./...
}

trap cleanup EXIT INT HUP TERM

run_step "required path check" check_required_paths
run_step "version policy check" check_version_policy
run_step "Docker standard policy check" check_docker_standard_policy
run_step "forbidden Node.js project file check" check_forbidden_node_files
run_step "forbidden unapproved registry dependency check" check_forbidden_unapproved_registries
run_step "direct FFI usage check" check_forbidden_direct_ffi_usage
run_step "system/data split policy check" check_system_data_split_policy
run_step "legacy Deno asset definition check" check_legacy_deno_assets

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
run_step "legacy docker Deno wrapper syntax check" \
  sh -n scripts/docker/deno.sh
run_step "legacy docker verify build script syntax check" \
  sh -n scripts/docker/verify-build.sh

require_command git

mkdir -p "$TMP_DIR"
run_step "Go execution check" check_go_execution_if_present

echo "adlaire-git-repository-check-ok"
