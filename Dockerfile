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

RUN chown -R 101:101 /etc/nginx/conf.d/ && \
    chown -R 101:101 /etc/nginx/templates/ && \
    chown -R 101:101 /usr/share/nginx/html/ && \
    chmod +x /docker-entrypoint.d/generate-config.sh && \
    # Ensure the nginx user can write to html directory
    chmod 755 /usr/share/nginx/html/

USER 101

EXPOSE 3000
