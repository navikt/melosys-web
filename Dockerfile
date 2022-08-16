FROM nginxinc/nginx-unprivileged

COPY /build /usr/share/nginx/html
COPY nais/proxy.nginx /etc/nginx/templates/default.conf.template

USER root
RUN chown -R 1069:1069 /etc/nginx/conf.d/
USER 1069
