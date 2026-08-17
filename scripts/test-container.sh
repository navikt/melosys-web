#!/usr/bin/env bash

set -euo pipefail

readonly IMAGE="melosys-web:container-test"
readonly CONTAINER="melosys-web-container-test-${RANDOM}"
readonly PORT="${CONTAINER_TEST_PORT:-3100}"
readonly MOCK_PORT="${CONTAINER_TEST_MOCK_PORT:-39090}"
readonly CONFIG_DIR="$(mktemp -d)"
DEPLOY="${NAIS_DEPLOY_BIN:-}"
MOCK_PID=""

DOCKER_HOST_ARGS=(--add-host "host.docker.internal:host-gateway")
while IFS= read -r host; do
  DOCKER_HOST_ARGS+=(--add-host "${host}:host-gateway")
done < <(
  jq -r '.APP_URL_MELOSYS, .APP_URL_TRYGDEAVTALE, .APP_URL_FAKTURERINGSKOMPONENTEN' nais/vars-*.json \
    | cut -d/ -f3 \
    | cut -d: -f1 \
    | sort -u
)

cleanup() {
  if [[ -n "${MOCK_PID}" ]]; then
    kill "${MOCK_PID}" >/dev/null 2>&1 || true
  fi
  docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true
  rm -rf "${CONFIG_DIR}"
}
trap cleanup EXIT

download_deploy() {
  local asset
  local asset_id
  local expected_sha

  case "$(uname -s)" in
    Darwin)
      asset="deploy-darwin"
      asset_id="503645626"
      expected_sha="f96132d70d641a005b9b05e3a937dafcc213d8c53757de44b87d5c8d21d8ad89"
      ;;
    Linux)
      asset="deploy-linux"
      asset_id="503645574"
      expected_sha="f13a29e0267160d6759c84e410e0b35b364a811dec95d05a79281a32adf5a227"
      ;;
    *)
      echo "Operativsystemet støttes ikke av container-testen: $(uname -s)" >&2
      exit 1
      ;;
  esac

  DEPLOY="${CONFIG_DIR}/nais-deploy"
  curl --fail --silent --show-error --location \
    --header "Accept: application/octet-stream" \
    "https://api.github.com/repos/nais/deploy/releases/assets/${asset_id}" \
    --output "${DEPLOY}"

  if command -v sha256sum >/dev/null; then
    echo "${expected_sha}  ${DEPLOY}" | sha256sum --check --status
  else
    echo "${expected_sha}  ${DEPLOY}" | shasum --algorithm 256 --check --status
  fi

  chmod +x "${DEPLOY}"
}

render_runtime_config() {
  local vars_file="$1"
  local cluster="$2"
  local payload="${CONFIG_DIR}/payload.json"

  CLUSTER="${cluster}" \
    RESOURCE="nais/runtime-config.yaml,nais/nais.yaml" \
    VARS="${vars_file}" \
    VAR="image=${IMAGE}" \
    DRY_RUN=true \
    PRINT_PAYLOAD=true \
    QUIET=true \
    TEAM=teammelosys \
    REPOSITORY=melosys-web \
    GRPC_AUTHENTICATION=false \
    GRPC_USE_TLS=false \
    "${DEPLOY}" >"${payload}"

  jq -er '.kubernetes.resources[] | select(.kind == "ConfigMap") | .data["default.conf"]' "${payload}" >"${CONFIG_DIR}/default.conf"
  jq -er '.kubernetes.resources[] | select(.kind == "ConfigMap") | .data["env-config.js"]' "${payload}" >"${CONFIG_DIR}/env-config.js"

  if grep --quiet '{{' "${CONFIG_DIR}/default.conf" "${CONFIG_DIR}/env-config.js"; then
    echo "Fant en uløst templatevariabel i ${vars_file}" >&2
    exit 1
  fi

  docker run --rm \
    "${DOCKER_HOST_ARGS[@]}" \
    --user 65532:65532 \
    --read-only \
    --tmpfs /run:rw,noexec,nosuid,size=1m \
    --tmpfs /var/lib/nginx/tmp:rw,noexec,nosuid,size=16m \
    --mount "type=bind,src=${CONFIG_DIR},dst=/etc/nginx/conf.d,readonly" \
    "${IMAGE}" -t -c /etc/nginx/nginx.conf -e /dev/stderr
}

if [[ -z "${DEPLOY}" ]]; then
  download_deploy
elif [[ ! -x "${DEPLOY}" ]]; then
  echo "NAIS_DEPLOY_BIN må peke på en kjørbar nais/deploy-binær" >&2
  exit 1
fi

docker build --check .
docker build --tag "${IMAGE}" .

render_runtime_config "nais/vars-q1.json" "dev-fss"
render_runtime_config "nais/vars-prod.json" "prod-fss"
render_runtime_config "nais/vars-q2.json" "dev-fss"

cat >"${CONFIG_DIR}/mock-server.mjs" <<'EOF'
import { createServer } from "node:http";

const port = Number(process.argv[2]);

createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      url: request.url,
      forwardedHost: request.headers["x-forwarded-host"],
      forwardedServer: request.headers["x-forwarded-server"],
      forwardedFor: request.headers["x-forwarded-for"],
    }),
  );
}).listen(port, "0.0.0.0");
EOF

node "${CONFIG_DIR}/mock-server.mjs" "${MOCK_PORT}" &
MOCK_PID=$!

for _ in {1..30}; do
  if curl --fail --silent "http://127.0.0.1:${MOCK_PORT}/ready" >/dev/null; then
    break
  fi
  sleep 1
done

sed -E "s#(proxy_pass \"?)https?://[^/]+#\\1http://host.docker.internal:${MOCK_PORT}#" \
  "${CONFIG_DIR}/default.conf" >"${CONFIG_DIR}/default.conf.test"
mv "${CONFIG_DIR}/default.conf.test" "${CONFIG_DIR}/default.conf"

docker run --rm \
  "${DOCKER_HOST_ARGS[@]}" \
  --user 65532:65532 \
  --read-only \
  --tmpfs /run:rw,noexec,nosuid,size=1m \
  --tmpfs /var/lib/nginx/tmp:rw,noexec,nosuid,size=16m \
  --mount "type=bind,src=${CONFIG_DIR},dst=/etc/nginx/conf.d,readonly" \
  "${IMAGE}" -t -c /etc/nginx/nginx.conf -e /dev/stderr

docker run --detach --rm \
  --name "${CONTAINER}" \
  "${DOCKER_HOST_ARGS[@]}" \
  --user 65532:65532 \
  --read-only \
  --tmpfs /run:rw,noexec,nosuid,size=1m \
  --tmpfs /var/lib/nginx/tmp:rw,noexec,nosuid,size=16m \
  --mount "type=bind,src=${CONFIG_DIR},dst=/etc/nginx/conf.d,readonly" \
  --publish "127.0.0.1:${PORT}:3000" \
  "${IMAGE}" >/dev/null

for _ in {1..30}; do
  if curl --fail --silent "http://127.0.0.1:${PORT}/melosys/health/is-ready" >/dev/null; then
    break
  fi
  sleep 1
done

test "$(curl --fail --silent "http://127.0.0.1:${PORT}/melosys/health/is-alive")" = "alive"
curl --fail --silent "http://127.0.0.1:${PORT}/melosys/health/is-ready" | grep --quiet '<div id="root"></div>'
curl --fail --silent "http://127.0.0.1:${PORT}/melosys/" | grep --quiet '<div id="root"></div>'
curl --fail --silent "http://127.0.0.1:${PORT}/env-config.js" | grep --quiet 'Melosys-q2'
curl --fail --silent --head "http://127.0.0.1:${PORT}/env-config.js" | grep --ignore-case --quiet 'Cache-Control: no-store'
curl --fail --silent --head "http://127.0.0.1:${PORT}/melosys/" | grep --ignore-case --quiet 'Cache-Control: no-store'

curl --fail --silent "http://127.0.0.1:${PORT}/api/test" | jq --exit-status '.url == "/api/test" and .forwardedHost != null and .forwardedServer != null and .forwardedFor != null' >/dev/null
curl --fail --silent "http://127.0.0.1:${PORT}/melosys/api/test" | jq --exit-status '.url == "/api/test"' >/dev/null
curl --fail --silent "http://127.0.0.1:${PORT}/graphql/test" | jq --exit-status '.url == "/graphql/test"' >/dev/null
curl --fail --silent "http://127.0.0.1:${PORT}/trygdeavtale-flyt/test" | jq --exit-status '.url == "/flyt/test"' >/dev/null
curl --fail --silent "http://127.0.0.1:${PORT}/faktureringskomponenten/test" | jq --exit-status '.url == "/test"' >/dev/null

test "$(curl --silent --output /dev/null --write-out '%{http_code}' "http://127.0.0.1:${PORT}/")" = "301"
curl --silent --head "http://127.0.0.1:${PORT}/" | grep --ignore-case --quiet '^Location: https://'

echo "Container-test besto på http://127.0.0.1:${PORT}"
