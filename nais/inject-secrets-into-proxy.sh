#!/bin/sh
echo "Starting exporting secrets"

# fetching env from vault file.
if test -d /var/run/secrets/nais.io/vault;
then
    for FILE in /var/run/secrets/nais.io/vault/*.env
    do
        for line in $(cat ${FILE}); do
            echo "Startup: exporting `echo ${line} | cut -d '=' -f 1`"
            export ${line}
        done
    done
fi

envsubst '$OIDC_PASSWORD' < /etc/nginx/templates/proxy > /etc/nginx/templates/default.conf.template
