FROM cgr.dev/chainguard/nginx

COPY --chown=65532:65532 ./build /usr/share/nginx/html

EXPOSE 3000
