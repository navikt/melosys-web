FROM nginxinc/nginx-unprivileged:alpine

# Fjern unødvendige pakker som lager CVEs
USER root
RUN apk del --no-cache curl wget ca-certificates && \
    apk upgrade --available && \
    rm -rf /var/cache/apk/* /usr/bin/wget /usr/bin/curl

COPY ./build /usr/share/nginx/html
COPY ./nais/proxy.nginx /etc/nginx/templates/default.conf.template
COPY generate-config.sh /docker-entrypoint.d/generate-config.sh

COPY .prod.env /app/.prod.env
COPY .q1.env /app/.q1.env
COPY .q2.env /app/.q2.env
COPY .local.env /app/.local.env

ENV ENVIRONMENT_NAME prod

# Bruk korrekt user ID for nginx-unprivileged:alpine (101)
RUN chown -R 101:101 /etc/nginx/conf.d/
RUN chown -R 101:101 /etc/nginx/templates/
RUN chown -R 101:101 /usr/share/nginx/html/
RUN chmod +x /docker-entrypoint.d/generate-config.sh

# Bytt til nginx user (101 for Alpine)
USER 101

EXPOSE 3000
