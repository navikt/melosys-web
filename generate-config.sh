#!/bin/sh
# Bygg opp en env-config.js-fil basert på miljøvariabler fra .env-filen

ENV_FILE="/app/.${ENVIRONMENT_NAME:-prod}.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Environment-fil ble ikke funnet: $ENV_FILE"
    exit 1
fi

echo "Leser filen $ENV_FILE"

# Start med ESM-kompatibel struktur
cat > /usr/share/nginx/html/env-config.js << 'EOF'
const envConfig = {
EOF

# Les hver linje i .env-filen
while IFS='=' read -r key value
do
  # Hopp over tomme linjer og linjer som starter med #
  if [ ! -z "$key" ] && [ "${key#\#}" = "$key" ]; then
    # Legg til miljøvariabelen til env-config.js
    echo "  $key: '$value'," >> /usr/share/nginx/html/env-config.js
  fi
done < "$ENV_FILE"

# Fullfør ESM-strukturen
cat >> /usr/share/nginx/html/env-config.js << 'EOF'
};

// Setter window.env for bakoverkompatibilitet
window.env = envConfig;

// Eksporterer som ES-modul
export default envConfig;
EOF
