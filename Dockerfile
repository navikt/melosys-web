FROM nginxinc/nginx-unprivileged

# Fjern avhengigheter som ikke er nødvendige for å kjøre nginx, og som skaper CVEs.
# Oppgrader OpenSSL for å fikse CVE-2025-15467
USER root
RUN apt-get update && \
    apt-get remove -y curl && \
    apt-get install -y --only-upgrade openssl libssl3 openssl-provider-legacy && \
    apt-get upgrade -y && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY ./build /usr/share/nginx/html
COPY ./nais/proxy.nginx /etc/nginx/templates/default.conf.template
COPY generate-config.sh /docker-entrypoint.d/generate-config.sh

COPY .prod.env /app/.prod.env
COPY .q1.env /app/.q1.env
COPY .q2.env /app/.q2.env
COPY .local.env /app/.local.env

ENV ENVIRONMENT_NAME=prod

USER root
RUN chown -R 1069:1069 /etc/nginx/conf.d/
RUN chown -R 1069:1069 /etc/nginx/templates/
RUN chown -R 1069:1069 /usr/share/nginx/html/
RUN chmod +x /docker-entrypoint.d/generate-config.sh
USER 1069

EXPOSE 3000
