FROM nginxinc/nginx-unprivileged:alpine

# Fjern unødvendige pakker som lager CVE-er
USER root
RUN apk del --no-cache curl wget ca-certificates && \
    apk upgrade --available && \
    rm -rf /var/cache/apk/* /usr/bin/wget /usr/bin/curl

COPY ./build /usr/share/nginx/html
COPY ./nais/proxy.nginx /etc/nginx/templates/default.conf.template
COPY generate-config.sh /tmp/generate-config.sh
COPY .prod.env .q1.env .q2.env .local.env /app/

# Generer ALLE miljøkonfigurasjoner under BUILD (eliminerer permission-problemer)
RUN chmod +x /tmp/generate-config.sh

# Generer konfigurasjon for hvert miljø som root (ingen permission-problemer)
RUN ENVIRONMENT_NAME=prod /tmp/generate-config.sh && \
    mv /usr/share/nginx/html/env-config.js /usr/share/nginx/html/env-config-prod.js

RUN ENVIRONMENT_NAME=q1 /tmp/generate-config.sh && \
    mv /usr/share/nginx/html/env-config.js /usr/share/nginx/html/env-config-q1.js

RUN ENVIRONMENT_NAME=q2 /tmp/generate-config.sh && \
    mv /usr/share/nginx/html/env-config.js /usr/share/nginx/html/env-config-q2.js

RUN ENVIRONMENT_NAME=local /tmp/generate-config.sh && \
    mv /usr/share/nginx/html/env-config.js /usr/share/nginx/html/env-config-local.js

# Lag et enkelt runtime-script som bare kopierer riktig fil (alltid fungerer)
RUN cat > /docker-entrypoint.d/select-config.sh << 'EOF'
#!/bin/sh
ENV_NAME=${ENVIRONMENT_NAME:-prod}
echo "Velger konfigurasjon for miljø: $ENV_NAME"
cp /usr/share/nginx/html/env-config-${ENV_NAME}.js /usr/share/nginx/html/env-config.js 2>/dev/null || {
    echo "Miljø $ENV_NAME ikke funnet, bruker prod som fallback"
    cp /usr/share/nginx/html/env-config-prod.js /usr/share/nginx/html/env-config.js
}
echo "env-config.js oppdatert for miljø: $ENV_NAME"
EOF

# Sett tillatelser og fjern gamle script
RUN chmod +x /docker-entrypoint.d/select-config.sh && \
    chown -R 101:101 /etc/nginx/conf.d/ && \
    chown -R 101:101 /etc/nginx/templates/ && \
    chown -R 101:101 /usr/share/nginx/html/ && \
    rm /tmp/generate-config.sh

ENV ENVIRONMENT_NAME=prod
USER 101
EXPOSE 3000
