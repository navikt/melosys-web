# E2E Test Recordings

Denne mappen inneholder innspilte API-responser for E2E-tester.

## Struktur

```text
recordings/
├── metadata.json           # Test metadata fra siste recording
├── index.json              # Index over alle recordings
├── shared/                 # Felles responser (kodeverk, etc.)
│   └── *.json
└── specs/                  # Per-test responser
    └── <spec-path>/
        └── <test-name>.json
```

## Slik genererer du nye recordings

```bash
# 1. Start melosys-api og alle avhengigheter
cd ../melosys-docker-compose && make start-all

# 2. Start melosys-api (i IDE eller terminal)
cd ../melosys-api && mvn spring-boot:run -pl app -Dspring-boot.run.profiles=local-mock

# 3. Kjør E2E-tester i record mode
cd melosys-web
pnpm test:e2e:record
```

## Viktig

- **Ikke rediger recordings manuelt** - de genereres automatisk
- **Commit recordings** etter oppdatering
- **Kjør record mode** når API-et endres
