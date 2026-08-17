#!/usr/bin/env bash

set -euo pipefail

readonly IMAGE="melosys-web:container-test"
readonly CONTAINER="melosys-web-container-test-${RANDOM}"
readonly PORT="${CONTAINER_TEST_PORT:-3100}"
readonly CONFIG_DIR="$(mktemp -d)"

cleanup() {
  docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true
  rm -rf "${CONFIG_DIR}"
}
trap cleanup EXIT

cat >"${CONFIG_DIR}/default.conf" <<'EOF'
server {
  root /usr/share/nginx/html;
  listen 3000;
  include /etc/nginx/mime.types;

  location = /env-config.js {
    alias /etc/nginx/conf.d/env-config.js;
    add_header Cache-Control "no-store";
  }

  location = /melosys/health/is-alive {
    access_log off;
    default_type text/plain;
    return 200 "alive\n";
  }

  location = /melosys/health/is-ready {
    access_log off;
    default_type text/plain;
    return 200 "ready\n";
  }

  location /api/ {
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://host.docker.internal:39090/api/;
  }

  location /melosys/ {
    try_files $uri /index.html;
  }

  location = / {
    return 301 http://$host/melosys/;
  }
}
EOF

cat >"${CONFIG_DIR}/env-config.js" <<'EOF'
const envConfig = { APP_NAME: "Container-test" };
window.env = envConfig;
export default envConfig;
EOF

docker build --check .
docker build --tag "${IMAGE}" .

docker run --rm \
  --user 65532:65532 \
  --read-only \
  --tmpfs /run:rw,noexec,nosuid,size=1m \
  --tmpfs /var/lib/nginx/tmp:rw,noexec,nosuid,size=16m \
  --mount "type=bind,src=${CONFIG_DIR},dst=/etc/nginx/conf.d,readonly" \
  "${IMAGE}" -t -c /etc/nginx/nginx.conf -e /dev/stderr

docker run --detach --rm \
  --name "${CONTAINER}" \
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
test "$(curl --fail --silent "http://127.0.0.1:${PORT}/melosys/health/is-ready")" = "ready"
curl --fail --silent "http://127.0.0.1:${PORT}/melosys/" | grep --quiet '<div id="root"></div>'
curl --fail --silent "http://127.0.0.1:${PORT}/env-config.js" | grep --quiet 'Container-test'
curl --fail --silent --head "http://127.0.0.1:${PORT}/env-config.js" | grep --ignore-case --quiet 'Cache-Control: no-store'

test "$(curl --silent --output /dev/null --write-out '%{http_code}' "http://127.0.0.1:${PORT}/")" = "301"

echo "Container-test besto på http://127.0.0.1:${PORT}"
