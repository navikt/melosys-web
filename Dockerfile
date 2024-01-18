FROM nginxinc/nginx-unprivileged

COPY ./build /usr/share/nginx/html
COPY ./nais/proxy.nginx /etc/nginx/templates/default.conf.template
COPY generate-config.sh /docker-entrypoint.d/generate-config.sh

COPY .prod.env /app/.prod.env
COPY .q1.env /app/.q1.env
COPY .q2.env /app/.q2.env
COPY .local.env /app/.local.env

ENV ENVIRONMENT_NAME prod

USER root
RUN chown -R 1069:1069 /etc/nginx/conf.d/
RUN chown -R 1069:1069 /etc/nginx/templates/
RUN chown -R 1069:1069 /usr/share/nginx/html/
RUN chmod +x /docker-entrypoint.d/generate-config.sh
USER 1069

EXPOSE 3000
