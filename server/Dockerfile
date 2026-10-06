FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:22
ENV NODE_ENV=production
COPY server/build /app
WORKDIR /app
EXPOSE 3000
CMD ["dist/index.js"]
