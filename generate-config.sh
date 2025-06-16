#!/bin/sh
# Bygg opp en env-config.mjs-fil basert på miljøvariabler fra .env-filen

ENV_FILE="/app/.${ENVIRONMENT_NAME:-prod}.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Environment-fil ble ikke funnet: $ENV_FILE"
    exit 1
fi

echo "Leser filen $ENV_FILE"

echo "window.env = {" > /usr/share/nginx/html/env-config.mjs

# Les hver linje i .env-filen
while IFS='=' read -r key value
do
  # Hopp over tomme linjer og linjer som starter med #
  if [ ! -z "$key" ] && [ "${key#\#}" = "$key" ]; then
    # Legg til miljøvariabelen til env-config.mjs
    echo "  $key: '$value'," >> /usr/share/nginx/html/env-config.mjs
  fi
done < "$ENV_FILE"

echo "};" >> /usr/share/nginx/html/env-config.mjs
