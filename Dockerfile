FROM nginxinc/nginx-unprivileged

COPY ./build /usr/share/nginx/html
COPY ./nais/proxy.nginx /etc/nginx/templates/proxy
COPY ./nais/inject-secrets-into-proxy.sh /docker-entrypoint.d/5-inject-secrets-into-proxy.sh

USER root
RUN chmod +x /docker-entrypoint.d/5-inject-secrets-into-proxy.sh
RUN chown -R 1069:1069 /etc/nginx/conf.d/
RUN chown -R 1069:1069 /etc/nginx/templates/
USER 1069

EXPOSE 3000
