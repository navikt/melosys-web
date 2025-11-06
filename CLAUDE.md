# CLAUDE.md

Denne filen er inngangsporten til Claude Code når den jobber i dette repositoriet.

**📍 Deployment:** Denne filen kopieres til `melosys-web/.claude/CLAUDE.md` ved setup.

## 📍 Hvor du er nå

Du er i **melosys-web**. For komplett dokumentasjon og detaljer, se:

👉 **`../melosys-web-ai-workspace/implementations/claude-code/CLAUDE.md`** - Claude Code instruksjoner
👉 **`../melosys-web-ai-workspace/core/docs/WORKFLOWS.md`** - Generiske workflows (AI-agnostisk)

---

## 🚀 Ved oppstart av sesjon

**VIKTIG:** Før du starter å jobbe, kjør alltid `/sync-config` for å sjekke om konfigurasjon er oppdatert.

**Les disse filene ved oppstart** for å få nødvendig kontekst:

1. **`../melosys-web-ai-workspace/implementations/claude-code/CLAUDE.md`**
   - Fullstendige Claude Code-instruksjoner
   - Tilgjengelige kommandoer og agents
   - Workflows og beste praksis

2. **`../melosys-web-ai-workspace/core/docs/WORKFLOWS.md`**
   - JIRA-arbeidsflyt (opprett → analyser → løs)
   - TODO-plan arbeidsflyt
   - TDD-prosess

3. **`../melosys-web-ai-workspace/core/docs/GIT_RULES.md`**
   - Git best practices
   - Hvordan håndtere nye filer (git add)
   - Hvordan bruke git mv for renaming

**Når du skal kode (før du skriver/endrer kode):**

- **`../melosys-web-ai-workspace/core/project-docs/KODESTANDARD.md`**
  - TypeScript-standarder, React-mønstre
  - Testing, styling, tilgjengelighet

**Når du jobber med JIRA-saker:**

- **`../melosys-web-ai-workspace/core/api-mapping/API_MAPPING_GUIDE.md`**
  - **KRITISK:** Følg alltid API-kallkjeden når du ser API-kall i koden
  - Quick Reference-tabell: URL-mønster → dokumentasjon
  - Identifiser om problem er frontend (parsing) eller backend (data)
  - API endpoint mapping (180+ endpoints)
  - **LES ALLTID når du ser `api.get()`, `api.post()`, `fetch()` i koden!**

**MCP Servers (hvis tilgjengelig):**
- Hvis MCP server for JIRA er konfigurert, bruk den for å hente JIRA-data
- Hvis MCP server for Confluence er konfigurert, bruk den for dokumentasjonsoppslag

---

## 🚫 KRITISK: Commit-håndtering

**⚠️ DU HAR IKKE TILGANG TIL `git commit` - SETTINGS.JSON BLOKKERER DET**

### Når skal du gi commit-melding?

**ALLTID** når du har fullført en oppgave som har medført endringer i filer:
- ✅ Automatisk etter hver ferdig oppgave
- ✅ Når brukeren eksplisitt ber om det
- ✅ Når du har implementert, refaktorert eller fikset noe

### Når brukeren sier "commit", "lag commit-melding", "insjekkingskommentar"

**Dette betyr:** Brukeren vil ha **TEKSTEN** til commit-meldingen som output.

**Det betyr IKKE:** At du skal kjøre `git commit`.

### Korrekt prosedyre:

1. ✅ **ALLTID sjekk git status FØRST:**
   ```bash
   git status
   ```
   - Se hva som er endret, staged, og allerede committed
   - Ikke foreslå å gjøre noe som allerede er gjort
   - Bare nevn endringer som faktisk er i denne batchen

2. ✅ Stage nye filer du har opprettet (med eksplisitte filnavn):
   ```bash
   git add path/to/fil1.ts path/to/fil2.tsx
   ```

3. ✅ **GI BRUKEREN TEKSTEN** i en kodeblokk (uten å kjøre git commit):
   ```text
   Lagt til ny funksjonalitet for X

   - Implementerte Y
   - Oppdaterte Z
   ```

4. ❌ **ALDRI** kjør `git commit` - du har IKKE tilgang
5. ❌ **ALDRI** spør "Skal jeg committe nå?" - ALDRI!
6. ❌ **ALDRI** spør "Vil du at jeg skal stage og committe?" - NEI!

### Commit-melding format

**✅ RIKTIG:**
- Norsk språk, bokmål
- Fortid ("La til", "Fikset", "Oppdaterte" - IKKE "Legg til", "Fiks")
- Konkret og beskrivende
- Fokuser på HVA som ble gjort, ikke HVEM som gjorde det

**❌ FEIL - ALDRI inkluder:**
- Selvpromotering: "Generert av Claude", "AI-assistert", "Claude Code", etc.
- Emojis: 🚀 ✨ 🎉
- Unødvendige detaljer eller chattiness
- Imperativ form ("Legg til", "Fiks")

**Eksempler:**

✅ **RIKTIG:**
```text
Lagt til validering for brukernavn i registreringsskjema

- Validerer at brukernavn er minimum 3 tegn
- Viser feilmelding ved ugyldig input
```

❌ **FEIL:**
```text
Legg til validering for brukernavn 🚀

Generert av Claude Code - la til validering som brukeren ba om.
```

### Hvorfor disse reglene?

- `settings.json` blokkerer eksplisitt `git commit` og `git push`
- Brukeren kjører selv `git commit` i terminalen
- Commit-historikk skal være profesjonell og fokusere på kodeendringer, ikke verktøy

---

## ⚠️ KRITISKE REGLER

### Kodestandarder

**⚠️ LES ALLTID FØRST:** `../melosys-web-ai-workspace/core/project-docs/KODESTANDARD.md`

**Denne filen MÅ leses før du:**
- ✅ Skriver ny kode
- ✅ Endrer eksisterende kode
- ✅ Refaktorerer
- ✅ Fikser bugs

**Filen inneholder:**
- TypeScript-standarder (ingen `any`, interface vs type)
- React-komponentmønstre (funksjonelle, hooks, props)
- Filnavngiving (kebab-case, PascalCase)
- Import-organisering (star-imports for Nav/Skjema)
- State management (Redux Ducks, local vs global)
- Skjemaer og validering (redux-form, yup)
- Styling (CSS Modules, Aksel tokens)
- Testing (Vitest, Playwright, 80% coverage)
- Feilhåndtering (Error Boundaries, try-catch)
- Tilgjengelighet (WCAG 2.1 AA, semantisk HTML)

### Git-håndtering

**Legg automatisk til nye filer DU har opprettet, men ALDRI andre filer!**

**❌ FORBUDT:**
- `git add .` / `git add -A` (legger til ALLE filer)
- Legge til filer du IKKE har opprettet (genererte, node_modules, etc.)

**✅ RIKTIG fremgangsmåte:**
1. Opprettet NYE filer → Kjør `git add` **automatisk** med eksplisitte filnavn
2. Eksempel: `git add reports/jira/MELOSYS-7890/*.md`
3. ALDRI legg til genererte/uønskede filer

**OBS:** Endrede filer (allerede tracked) håndteres av brukeren i WebStorm.

### Filrenaming (JS→TS konvertering)

**Bruk ALLTID `git mv` for å bevare git-historikk!**

```bash
# ✅ Riktig - bevarer historikk
git mv src/utils/land.js src/utils/land.ts

# ❌ Feil - mister historikk
rm src/utils/land.js  # + opprett ny .ts fil
```

**Arbeidsflyt:**
1. `git mv old.js new.ts` (først!)
2. Konverter innhold til TypeScript
3. `git add new.ts` (endringene)

### Testing

**ALLTID kjør tester når du oppretter eller endrer dem!**

```bash
# Enhetstester
pnpm test -- --run                 # Alle tester (ALLTID bruk --run!)
pnpm test -- --run <filnavn>       # Spesifikk testfil

# E2E-tester
pnpm run test:e2e                   # Alle e2e-tester
pnpm exec playwright test <filnavn>      # Spesifikk e2e-test
```

**Før commit:** Verifiser at alle tester passerer (grønne ✅)

### Markdown kodeblokker

**Bruk riktig språk-markering:**
- `tsx` - TypeScript med JSX (React: `<Component />`)
- `typescript` - TypeScript uten JSX
- `bash` - Shell-kommandoer

**Hvorfor:** IDEer parser kodeblokker og gir feil hvis syntaks ikke matcher.

## 📁 Dokumentasjon i workspace

- **JIRA-tickets:** `../melosys-web-ai-workspace/reports/jira/{ISSUE_ID}/`
  - `1-beskrivelse.md`, `2-analyse.md`, `3-løsning.md`, `4-status.md`
  - **OBS:** Hvis `MELOSYS_REPORTS_PATH` er satt, skrives reports til den lokasjonen i stedet
- **API-mapping:** `../melosys-web-ai-workspace/core/api-mapping/`
  - `API_MAPPING_GUIDE.md` - Hvordan identifisere frontend ↔ backend påvirkning
- **Todo-planer:** `../melosys-web-ai-workspace/todo/`
  - **OBS:** Hvis `MELOSYS_REPORTS_PATH` er satt, skrives todos til den lokasjonen i stedet
- **Generiske workflows:** `../melosys-web-ai-workspace/core/docs/`
  - `WORKFLOWS.md`, `GIT_RULES.md`, `TESTING_RULES.md`, etc.

## 🛠️ Mest brukte kommandoer

**JIRA-arbeidsflyt:**
- `/jira-opprett MELOSYS-XXXX` - Opprett dokumentstruktur
- `/jira-analyser MELOSYS-XXXX` - Analyser kodebase og oppdater dokumentasjon
- `/jira-løs MELOSYS-XXXX` - Implementer løsningen med TDD

**For fullstendig kommandoliste og detaljer:**
👉 Se `../melosys-web-ai-workspace/implementations/claude-code/CLAUDE.md` (seksjon "Tilgjengelige kommandoer")

## 🗣️ Språk

- **Kommunikasjon:** Alltid norsk (bokmål)
- **Commit-meldinger:** Norsk, i fortid (f.eks. "La til validering", ikke "Legg til validering")

## 📚 Les mer

- **Claude Code-instruksjoner:** `../melosys-web-ai-workspace/implementations/claude-code/CLAUDE.md`
- **JIRA-integrasjon:** `../melosys-web-ai-workspace/implementations/claude-code/README.md`
- **Generiske workflows:** `../melosys-web-ai-workspace/core/docs/WORKFLOWS.md`
- **Dokumentstandard:** `../melosys-web-ai-workspace/core/docs/DOCUMENTATION_STANDARD.md`
- **Kodestandard:** `../melosys-web-ai-workspace/core/project-docs/KODESTANDARD.md`
- **Melosys-web arkitektur:** `../melosys-web-ai-workspace/core/project-docs/MELOSYS_WEB_UTVIKLING.md`
