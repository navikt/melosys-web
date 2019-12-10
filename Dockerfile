FROM navikt/nginx-oidc:latest

ENV APP_DIR="/app" \
  APP_CALLBACK_PATH="/openid_connect_login" \
  APP_PATH_PREFIX="/melosys" \
  APP_URL_MELOSYS="http://melosys" \
  APP_PORT="3000"

COPY ./build /app/melosys
COPY ./nais/proxy.nginx /nginx/proxy.nginx

EXPOSE 3000
