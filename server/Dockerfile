FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22
ENV NODE_ENV=production
COPY server/build /app
WORKDIR /app
# package.json/pnpm-lock.yaml/node_modules (rot-prosjektet, prod-only, pruned
# i CI) er kun til stede for at SBOM-verktøy (Syft) skal kunne oppdage
# npm-avhengighetene som er bundlet inn i de statiske JS-filene i public/.
# De brukes ikke av Express-serveren (ligger utenfor working directory).
COPY package.json pnpm-lock.yaml node_modules /sbom-source/
EXPOSE 3000
CMD ["dist/index.js"]
