FROM cgr.dev/chainguard/nginx@sha256:85293f79f17cf78792313ca87d316b2f5fa7d0fcff18a33c8e9597cafddb44f0

COPY --chown=65532:65532 ./build /usr/share/nginx/html

EXPOSE 3000
