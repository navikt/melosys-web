FROM cgr.dev/chainguard/nginx

COPY --chown=65532:65532 ./build /usr/share/nginx/html
# package.json/pnpm-lock.yaml/node_modules (prod-only, pruned in CI) er kun til stede
# for at SBOM-verktøy (Syft) skal kunne oppdage npm-avhengighetene som er bundlet
# inn i de statiske JS-filene ovenfor. De serveres ikke av nginx (ligger utenfor html-mappa).
COPY --chown=65532:65532 package.json pnpm-lock.yaml node_modules /sbom-source/

EXPOSE 3000
