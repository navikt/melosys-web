FROM navikt/nginx-oidc:latest

ENV APP_DIR="/app" \
  APP_CALLBACK_PATH="/openid_connect_login" \
  APP_PATH_PREFIX="/" \
  APP_URL_MELOSYS="http://localhost:3002" \
  APP_PORT="8080" \
  REDIS_HOST="redis"

COPY /build /app
COPY proxy.nginx /nginx/proxy.nginx

EXPOSE 9000 8080
