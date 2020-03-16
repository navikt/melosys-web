FROM cypress/included:4.1.0
WORKDIR /usr/src/app
COPY . .
RUN CYPRESS_INSTALL_BINARY=0 npm ci
CMD ["npx", "run", "cypress"]