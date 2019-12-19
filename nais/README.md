Frontend deployes i en nginx-container som tar seg av oidc-oppsett. I `proxy.nginx`
defineres proxy til melosys backend.

Følgende ENV-variabler må settes i vault for å kunne rulle ut til et miljø.
```$bash
OIDC_AGENTNAME
OIDC_HOST_URL
OIDC_PASSWORD
```
