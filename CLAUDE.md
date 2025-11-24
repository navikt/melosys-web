# CLAUDE.md - Claude Code Implementasjon


---

## Innledning

Denne filen er inngangsporten til **Claude Code** når du jobber med Melosys-prosjektene.

**📍 Målgruppe:** AI-assistenter (Claude Code)
**🎯 Formål:** Claude Code-spesifikke instruksjoner og kommandoer
**👤 Menneske som skal sette opp?** → Les [INSTALL.md](INSTALL.md)
**📖 Generiske workflows?** → Les [core/docs/WORKFLOWS.md](core/docs/WORKFLOWS.md)

**VIKTIG:** Denne implementasjonen bygger på **generisk innhold** i `core/`-katalogen:
- **Workflows:** `core/docs/WORKFLOWS.md`
- **Git-regler:** `core/docs/GIT_RULES.md`
- **Testing-regler:** `core/docs/TESTING_RULES.md`
- **JIRA-integrasjon:** `core/docs/JIRA_INTEGRATION.md`
- **Dokumentstandard:** `core/docs/DOCUMENTATION_STANDARD.md`

---

## Ved start av ny sesjon

### Dokumentasjon å lese ved oppstart

**Les disse filene for å få nødvendig kontekst:**

1. **Denne filen** (CLAUDE.md) - Fullstendige instruksjoner (du leser den nå)

2. **[core/docs/WORKFLOWS.md](core/docs/WORKFLOWS.md)**
   - JIRA-arbeidsflyt (opprett → analyser → løs)
   - TODO-plan arbeidsflyt
   - TDD-prosess (RED → GREEN → REFACTOR)

3. **[core/docs/GIT_RULES.md](core/docs/GIT_RULES.md)**
   - Git best practices
   - Hvordan håndtere nye filer (git add med eksplisitte filnavn)
   - Hvordan bruke git mv for renaming

**Når du skal kode:**

- **[systems/melosys-web/docs/KODESTANDARD.md](systems/melosys-web/docs/KODESTANDARD.md)**
  - TypeScript-standarder, React-mønstre
  - Testing, styling, tilgjengelighet
  - **LES ALLTID før du skriver/endrer kode!**

**Når du jobber med JIRA-saker:**

- **[systems/melosys-web/api-mapping/API_MAPPING_GUIDE.md](systems/melosys-web/api-mapping/API_MAPPING_GUIDE.md)**
  - **KRITISK:** Følg alltid API-kallkjeden når du ser API-kall i koden
  - Quick Reference-tabell: URL-mønster → dokumentasjon
  - Identifiser om problem er frontend (parsing) eller backend (data)
  - API endpoint mapping (180+ endpoints)
  - **LES ALLTID når du ser `api.get()`, `api.post()`, `fetch()` i koden!**

- **[systems/melosys-api/README.md](systems/melosys-api/README.md)**
  - ⭐ **VIKTIG:** Inngangsport til melosys-api dokumentasjon
  - Arkitektur, avhengigheter, endpoints
  - **[patterns.md](systems/melosys-api/patterns.md)** - Designmønstre og "ripple effects"
  - **LES når du analyserer JIRA-saker som påvirker backend!**

**MCP Servers:**
- Hvis MCP server for JIRA er tilgjengelig, bruk den for å hente JIRA-data
- Hvis MCP server for Confluence er tilgjengelig, bruk den for dokumentasjonsoppslag

---

## KRITISK: Commit-håndtering

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

1. ✅ Kjør `git status` for å se endringer
2. ✅ Kjør `git add path/to/file` for NYE filer du har opprettet (bruk eksplisitte filnavn)
3. ✅ **GI BRUKEREN COMMIT-MELDINGEN** som tekst i en kodeblokk
4. ❌ **ALDRI** kjør `git commit` (du har ikke tilgang)
5. ❌ **ALDRI** spør "Skal jeg committe nå?"

**Eksempel - RIKTIG:**
```text
✅ Kjører git status...
✅ Stager nye filer: git add reports/jira/MELOSYS-7890/1-beskrivelse.md

Her er commit-meldingen:

```text
La til JIRA-dokumentasjon for MELOSYS-7890

Opprettet 4-fils struktur:
- 1-beskrivelse.md - JIRA-data og akseptansekriterier
- 2-analyse.md - Kodebase-analyse (5 påvirkede filer)
- 3-løsning.md - TDD-basert implementeringsplan
- 4-status.md - Fremdriftssporing
```text
```text

**Eksempel - FEIL:**
```text
❌ Skal jeg kjøre git commit nå?
❌ git commit -m "..." (BLOKKERT av settings.json)
```text

### Commit-melding format

**Se:** `core/docs/GIT_RULES.md#commit-meldinger`

**Format:**
```text
<Hovedhandling> i <preteritum/fortid>

Detaljer:
- Punkt 1
- Punkt 2
```text

**Eksempler:**
- ✅ "La til validering for e-postfelt"
- ✅ "Fikset bug i brukerinnlogging"
- ✅ "Refaktorerte UserProfile til functional component"
- ❌ "Legg til validering" (imperativ, ikke preteritum)
- ❌ "WIP" (ikke beskrivende)

### Hvorfor disse reglene?

Claude Code har IKKE tilgang til `git commit` fordi:
1. **Hooks:** Git hooks (pre-commit linting etc.) skal kjøres av brukeren
2. **Kontroll:** Brukeren skal ha siste ord på commit-meldinger
3. **Review:** Brukeren kan justere melding før commit


---

# Melosys Aide - Felles Instruksjoner

> **Obs:** Denne filen er en del av AOP-inspirert instruksjonsstruktur.
> Felles innhold vedlikeholdes her og "injectes" i AI-spesifikke instruksjonsfiler.

---

## Workspace-struktur

```text
melosys-aide/
│
├── core/                          # ✅ GENERISK (AI-agnostic)
│   ├── docs/                      # Workflows, regler, standarder
│   ├── templates/                 # Dokumentmaler (JIRA/TODO)
│   ├── scripts/                   # Python scripts (aide-jira-fetch, etc.)
│   ├── api-mapping/               # API-dokumentasjon
│   ├── project-docs/              # Melosys-spesifikk info
│   └── instructions/              # Felles AI-instruksjoner (denne filen)
│
├── implementations/               # 🤖 AI-SPESIFIKK
│   ├── claude-code/               # Claude Code-implementasjon
│   ├── codex/                     # OpenAI Codex-implementasjon
│   └── copilot/                   # GitHub Copilot-implementasjon
│
├── systems/                       # 📦 SYSTEMER
│   ├── melosys-web/               # Frontend (React/TypeScript)
│   ├── melosys-api/               # Backend (Spring Boot/Kotlin)
│   └── api-mapping/               # Frontend ↔ Backend API-mapping
│
├── reports/jira/                  # ✅ OUTPUT (AI-agnostic) *
│   └── MELOSYS-XXXX/
│
└── todo/                          # ✅ OUTPUT (AI-agnostic) *
    └── XX-navn/
```

**\* OBS:** Hvis `MELOSYS_AIDE_REPORTS_PATH` environment variable er satt, skrives reports til den lokasjonen i stedet.

---

## Environment-variabler

**KRITISK:** Disse environment-variablene MÅ være satt for at workspace-et skal fungere:

### MELOSYS_AIDE_INSTALLATION_PATH (PÅKREVD)

Path til melosys-aide workspace-roten.

```bash
export MELOSYS_AIDE_INSTALLATION_PATH="/Users/$(whoami)/develop/nav/melosys-aide"
```

**Brukes til:**
- Finne templates i `$MELOSYS_AIDE_INSTALLATION_PATH/core/templates/`
- Finne konfigurasjon i `$MELOSYS_AIDE_INSTALLATION_PATH/systems/repo-search-config.json`
- Relativ path-resolving

### MELOSYS_AIDE_REPORTS_PATH (VALGFRI)

Path til hvor reports skal lagres (JIRA-dokumenter og TODO-planer).

```bash
# Hvis IKKE satt: Reports lagres i workspace
# Default: $MELOSYS_AIDE_INSTALLATION_PATH/reports/

# Hvis satt: Reports lagres i egen mappe (f.eks. privat repo eller skylagring)
export MELOSYS_AIDE_REPORTS_PATH="/Users/$(whoami)/Documents/melosys-reports"
# eller
export MELOSYS_AIDE_REPORTS_PATH="/Users/$(whoami)/Dropbox/melosys-reports"
```

**Brukes til:**
- Lagre JIRA-dokumentasjon: `$MELOSYS_AIDE_REPORTS_PATH/jira/MELOSYS-XXXX/`
- Lagre TODO-planer: `$MELOSYS_AIDE_REPORTS_PATH/todo/XX-navn/`

**Viktig:**
- Hvis `MELOSYS_AIDE_REPORTS_PATH` er satt: **HOPP OVER** `git add` for reports (de er i annet repo)
- Hvis IKKE satt: Stage reports normalt med `git add reports/jira/...`

---

## Viktige dokumenter (LES ALLTID)

### 1. Workflows

**Fil:** `core/docs/WORKFLOWS.md`

Følg **alltid** disse workflows:

**JIRA-sak workflow:**
```text
Opprett → Analyser → Løs → Verifiser
```

**TODO-plan workflow:**
```text
Opprett → Analyser → Løs → Verifiser
```

**TDD-prosess:**
```text
RED → GREEN → REFACTOR
```

### 2. Git-regler

**Fil:** `core/docs/GIT_RULES.md`

**KRITISKE REGLER:**
- ❌ ALDRI bruk `git add .` eller `git add -A`
- ✅ Bruk eksplisitte filnavn: `git add reports/jira/MELOSYS-7890/beskrivelse.md`
- ✅ Stage nye filer DU har opprettet automatisk
- ✅ Bruk `git mv` for renaming (bevarer historikk)
- ✅ Commit-meldinger på norsk, preteritum (fortid)

### 3. Testing-regler

**Fil:** `core/docs/TESTING_RULES.md`

**KRITISKE REGLER:**
- ✅ ALLTID kjør tester når du oppretter/endrer dem
- ✅ Bruk `pnpm test -- --run` (IKKE watch mode)
- ✅ TDD-tilnærming: RED → GREEN → REFACTOR
- ❌ ALDRI committe tester som feiler

### 4. Dokumentasjonsstandard

**Fil:** `core/docs/DOCUMENTATION_STANDARD.md`

**4-fils struktur for JIRA-saker:**
```text
reports/jira/MELOSYS-XXXX/
├── 1-beskrivelse.md    # JIRA-data, omfang, akseptansekriterier
├── 2-analyse.md        # Funn, kompleksitet, risikoanalyse
├── 3-løsning.md        # Implementeringsplan med TDD
└── 4-status.md         # Fremdriftssporing
```

**Templates:** `core/templates/jira/`

### 5. Kodestandarder

**Fil:** `systems/melosys-web/docs/KODESTANDARD.md`

**KRITISKE REGLER:**
- TypeScript (ikke JavaScript)
- Funksjonelle komponenter (ikke class components)
- react-hook-form (ikke redux-form)
- Én komponent per fil
- Maks 300 linjer per fil
- Testing med Vitest

**Kvalitetssikring (kjør ALLTID etter implementering):**
```bash
npx tsc --noEmit      # TypeScript check
pnpm run eslint       # ESLint
pnpm test -- --run    # Alle tester
pnpm run build        # Bygg
```

### 6. API-mapping

**Fil:** `systems/melosys-web/api-mapping/API_MAPPING_GUIDE.md`

Bruk API-mappingen til å:
- Finne backend-endpoints for frontend-kode
- Identifisere fil:linje for backend-handlers
- Vurdere om endring påvirker frontend, backend, eller begge

**Quick reference:** `systems/melosys-web/api-mapping/melosys_quick_reference.md`

### 7. Markdown linting

**Fil:** `core/docs/MARKDOWN_LINTING.md`

**KRITISKE REGLER:**
- ✅ Kjør `npx markdownlint-cli2 <file.md>` **umiddelbart** etter skriving/endring av markdown
- ✅ Fiks alle MD029 (list numbering), MD040 (code block language), MD051 (anchor links) feil
- ✅ Verifiser at **alle markdown-feil er fikset** før commit

**Kodeblokk-språk:**
- `tsx` for TypeScript med JSX (React: `<Component />`)
- `typescript` for TypeScript uten JSX
- `bash` for shell-kommandoer

---

## Absolutte regler (ALDRI bryt disse)

### Git

- ❌ ALDRI bruk `git add .` eller `git add -A`
- ❌ ALDRI stage filer du ikke har opprettet selv
- ❌ ALDRI committe genererte filer (node_modules, build/, .DS_Store)

### Testing

- ❌ ALDRI committe tester som feiler
- ❌ ALDRI bruk watch mode i CI/CD-kontekst (bruk `--run`)
- ❌ ALDRI hopp over tester ved implementering

### Koding

- ❌ ALDRI bruk JavaScript - KUN TypeScript
- ❌ ALDRI bruk class components - KUN funksjonelle
- ❌ ALDRI bruk redux-form - KUN react-hook-form
- ❌ ALDRI filer over 300 linjer - split dem opp

### Dokumentasjon

- ❌ ALDRI skip 4-fils struktur for JIRA-saker
- ❌ ALDRI analyser kodebase uten fil:linje referanser
- ❌ ALDRI lag implementeringsplan uten TDD-struktur

---

## Best practices

### 1. Vær iterativ

Ikke gjør alt på en gang. Bryt ned i mindre steg:
1. Analyser → Stopp og vis funn
2. Skriv tester → Stopp og verifiser
3. Implementer → Stopp og test
4. Refaktorer → Stopp og kvalitetssjekk

### 2. Be om bekreftelse

Ved kritiske steg (RED → GREEN → REFACTOR), **STOPP** og be bruker om bekreftelse.

### 3. Referer til dokumentasjon

Alltid referer til hvilken doc du følger:
- "Følger core/docs/WORKFLOWS.md - Fase 2"
- "Følger core/docs/TESTING_RULES.md - RED phase"
- "Følger systems/melosys-web/docs/KODESTANDARD.md - React-komponenter"

### 4. Bruk fil:linje referanser

Når du refererer til kode:
- ✅ "Filen `UserProfile.tsx:45` bruker redux-form"
- ❌ "UserProfile-komponenten bruker redux-form"

### 5. Oppsummer før du starter

Før du begynner en oppgave, oppsummer:
- Hva skal gjøres?
- Hvilke filer skal endres?
- Hvilke tester skal skrives?
- Hvilken dokumentasjon følges?

---

## Språk

- **Kommunikasjon:** Alltid norsk (bokmål)
- **Commit-meldinger:** Norsk, i fortid (f.eks. "La til validering", ikke "Legg til validering")
- **Kode og kommentarer:** Engelsk (følger bransjepraksis)

---

## Referanser

**Må lese før implementering:**
- ✅ `core/docs/WORKFLOWS.md` - Workflows
- ✅ `core/docs/GIT_RULES.md` - Git-regler
- ✅ `core/docs/TESTING_RULES.md` - Testing-regler
- ✅ `core/docs/DOCUMENTATION_STANDARD.md` - Dokumentstandard
- ✅ `core/docs/MARKDOWN_LINTING.md` - Markdown linting
- ✅ `systems/melosys-web/docs/KODESTANDARD.md` - Kodestandarder
- ✅ `systems/melosys-web/docs/MELOSYS_WEB_UTVIKLING.md` - Utviklingsguide

**Nyttig referanse:**
- 📖 `systems/melosys-web/api-mapping/API_MAPPING_GUIDE.md` - API-mapping guide
- 📖 `systems/melosys-web/api-mapping/melosys_quick_reference.md` - Quick reference
- 📖 `systems/melosys-api/README.md` - Backend-dokumentasjon
- 📖 `systems/melosys-api/patterns.md` - Design patterns og ripple effects


---

## 🧠 Skills (Auto-invoked)

Claude Code har innebygde skills som **automatisk aktiveres** basert på kontekst.

**Når du jobber med React/TypeScript:** `melosys-web-expert` aktiveres
**Når du jobber med Spring Boot/Kotlin:** `melosys-api-expert` aktiveres
**Når du implementerer kode:** `tdd-coach` aktiveres
**Når du analyserer JIRA-saker:** `task-workflow-assistant` aktiveres
**Når du vurderer arkitektur:** `architecture-advisor` aktiveres

---


---

# Skill: architecture-advisor (Arkitektur-beslutninger)

> **Ekspertise:** Arkitektur-vurderinger og refaktoreringsbeslutninger

---

## Når å bruke denne skill

- Du vurderer arkitektur-endringer
- Du skal refaktorere større kodedeler
- Du skal introdusere nye design patterns
- Du skal evaluere code smells

---

## Layered Architecture

**Standard lag i både frontend og backend:**

```text
Presentation Layer (UI/API)
    ↓
Business Logic Layer (Services)
    ↓
Data Access Layer (Repositories)
    ↓
Database/External APIs
```

**Prinsipper:**
- ✅ Klar separasjon av ansvar
- ✅ Hver lag kommuniserer kun med laget under
- ✅ Business logic i eget lag (IKKE i controllers eller repositories)

---

## Design Patterns

### Repository Pattern (Data Access)

```kotlin
interface UserRepository {
    fun findById(id: Long): User?
    fun save(user: User): User
}
```

### Service Pattern (Business Logic)

```kotlin
class UserService(private val repository: UserRepository) {
    fun updateUser(id: Long, data: UserData): User {
        val user = repository.findById(id) ?: throw NotFoundException()
        return repository.save(user.copy(name = data.name))
    }
}
```

### Factory Pattern (Objektoppretting)

```typescript
class ComponentFactory {
  static create(type: string): Component {
    switch (type) {
      case 'button': return new ButtonComponent();
      case 'input': return new InputComponent();
      default: throw new Error('Unknown type');
    }
  }
}
```

### Strategy Pattern (Valgbare algoritmer)

```typescript
interface ValidationStrategy {
  validate(value: string): boolean;
}

class EmailValidator implements ValidationStrategy {
  validate(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
```

---

## Refactoring Strategies

### 1. Start med tester (sikkerhetsnett)

```bash
# ALLTID før refaktorering:
pnpm test -- --run
# Verifiser at alle tester passerer
```

### 2. Små, inkrementelle endringer

- ❌ Ikke refaktorer hele filen på en gang
- ✅ Refaktorer én funksjon/klasse av gangen
- ✅ Kjør tester etter hver endring

### 3. Verifiser etter hvert steg

```bash
# Etter hver refaktorering:
pnpm test -- --run           # Tester
npx tsc --noEmit             # TypeScript
pnpm run eslint              # Linting
```

### 4. Aldri endre oppførsel under refaktorering

- Refaktorering = samme output, bedre kode
- Ny funksjonalitet = separat commit

---

## Code Smells å unngå

### God Functions (> 50 linjer)

**Problem:**
```typescript
function processUser(user: User) {
  // 200 linjer kode...
}
```

**Løsning:**
```typescript
function processUser(user: User) {
  validateUser(user);
  enrichUserData(user);
  saveUser(user);
  sendNotification(user);
}
```

### Duplisert kode

**Problem:**
```typescript
// I UserProfile.tsx
const fullName = user.firstName + ' ' + user.lastName;

// I UserCard.tsx
const fullName = user.firstName + ' ' + user.lastName;
```

**Løsning:**
```typescript
// I utils/userUtils.ts
export const getFullName = (user: User) =>
  `${user.firstName} ${user.lastName}`;
```

### For mange avhengigheter

**Problem:**
```kotlin
class UserService(
  private val repo1: Repo1,
  private val repo2: Repo2,
  private val repo3: Repo3,
  private val service1: Service1,
  private val service2: Service2,
  // ... 10 flere
)
```

**Løsning:**
- Split i mindre services
- Bruk facade pattern
- Vurder om all logikk hører hjemme her

### Mangel på abstraksjon

**Problem:**
```typescript
if (user.role === 'admin' || user.role === 'superadmin') {
  // ... 50 steder i koden
}
```

**Løsning:**
```typescript
const isAdmin = (user: User) =>
  ['admin', 'superadmin'].includes(user.role);

if (isAdmin(user)) {
  // ...
}
```

---

## Referanser

- `systems/melosys-api/patterns.md` - Backend design patterns
- `systems/melosys-web/docs/KODESTANDARD.md` - Frontend patterns


---

# Skill: melosys-api-expert (Backend)

> **Ekspertise:** Spring Boot/Kotlin utvikling for melosys-api

---

## Når å bruke denne skill

- Du jobber med Spring Boot/Kotlin-kode
- Du skal implementere nye API-endpoints
- Du skal refaktorere backend-logikk
- Du skal skrive backend-tester

---

## Regler

### Kotlin-mønstre

- ✅ **Kotlin** (IKKE Java for ny kode)
- ✅ **Domain-Driven Design** (domain model patterns)
- ✅ **Layered architecture** (controller → service → repository)
- ✅ **Immutability** (data classes, val, ikke var)
- ✅ **Null-safety** (Kotlin nullable types)
- ✅ **MockK** for mocking i tester

### Ripple effects - vær obs på

**KRITISK:** Endringer i backend påvirker ofte flere lag:

- Endringer i **domain model** påvirker:
  - Controller (DTO mapping)
  - Service (business logic)
  - Repository (database access)
  - Database schema (Flyway migreringer)

- Endringer i **API-kontrakter** påvirker:
  - Frontend (bruk `systems/melosys-web/api-mapping/` for å finne påvirkede filer)
  - Andre mikrotjenester (hvis eksponert)

### Arkitektur

```text
Controller (REST API)
    ↓
Service (Business logic)
    ↓
Repository (Data access)
    ↓
Database (PostgreSQL)
```

**Husk:**
- Controller skal IKKE inneholde business logic
- Service skal IKKE kjenne til HTTP-detaljer
- Repository skal IKKE inneholde business logic

---

## Referanser

- `systems/melosys-api/README.md` - Inngangsport til backend-dokumentasjon
- `systems/melosys-api/patterns.md` - Design patterns og ripple effects
- `systems/melosys-web/api-mapping/API_MAPPING_GUIDE.md` - Frontend ↔ Backend mapping


---

# Skill: melosys-web-expert (Frontend)

> **Ekspertise:** React/TypeScript utvikling for melosys-web

---

## Når å bruke denne skill

- Du jobber med React/TypeScript-kode
- Du skal implementere nye komponenter
- Du skal refaktorere eksisterende komponenter
- Du skal skrive frontend-tester

---

## Regler

### React-mønstre

- ✅ **Funksjonelle komponenter** med hooks (IKKE class-komponenter)
- ✅ **react-hook-form** (IKKE redux-form)
- ✅ **NAV Design System** (`@navikt/ds-react`)
  - Star-import: `import * as aksel from '@navikt/ds-react'`
  - Bruk `<aksel.Button>`, `<aksel.TextField>`, etc.
- ✅ **TypeScript strict mode**
- ✅ Maks 300 linjer per fil
- ✅ Én komponent per fil
- ❌ ALDRI default imports fra NAV-komponenter

### Import-regler

```typescript
// ✅ Star-import for NAV-komponenter
import * as aksel from '@navikt/ds-react';

// ✅ Named imports for utility
import { getPath } from '../utils';

// ❌ IKKE default import
import Button from '@navikt/ds-react';
```

### Testing

- ✅ **Vitest** + **React Testing Library** for testing
- ✅ `describe` + `it` struktur
- ✅ Mock eksterne avhengigheter
- ✅ Test happy path, edge cases, errors
- ✅ Målsetning: 80% coverage

**Eksempel:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('should render user name', () => {
    render(<UserProfile name="Test User" />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should handle missing user gracefully', () => {
    render(<UserProfile name={undefined} />);
    expect(screen.getByText('Ukjent bruker')).toBeInTheDocument();
  });
});
```

---

## Referanser

- `systems/melosys-web/docs/KODESTANDARD.md` - Fullstendig kodestandard
- `systems/melosys-web/docs/MELOSYS_WEB_UTVIKLING.md` - Utviklingsguide
- `systems/melosys-web/api-mapping/API_MAPPING_GUIDE.md` - Finne backend-endpoints


---

# Skill: task-workflow-assistant (JIRA/TODO-analyse)

> **Ekspertise:** Strukturert analyse og planlegging av JIRA-saker og TODO-planer

---

## Når å bruke denne skill

- Du skal analysere en JIRA-sak
- Du skal lage en TODO-plan
- Du skal identifisere påvirkede filer
- Du skal estimere kompleksitet

---

## 4-fils struktur

### 1. beskrivelse.md

**Innhold:**
- JIRA-data (tittel, beskrivelse, akseptansekriterier)
- Omfang (hva skal gjøres, hva skal IKKE gjøres)
- Forutsetninger og avhengigheter

**Template:** `core/templates/jira/1-beskrivelse.md`

### 2. analyse.md

**Innhold:**
- Påvirkede filer (med **fil:linje** referanser)
- Kompleksitet (enkel/middels/kompleks)
- Risikoanalyse
- API-påvirkning (frontend ↔ backend)

**Template:** `core/templates/jira/2-analyse.md`

**Eksempel:**
```markdown
## Påvirkede filer

### Frontend
- `src/components/UserProfile.tsx:45` - Må oppdatere form-validering
- `src/api/userApi.ts:12` - Må legge til nytt endpoint-kall

### Backend
- `no/nav/melosys/api/UserController.kt:78` - Må oppdatereDTO
- `no/nav/melosys/domain/User.kt:23` - Må legge til nytt felt
```

### 3. løsning.md

**Innhold:**
- TDD-basert implementeringsplan
- Steg 0: Skriv tester (RED phase)
- Steg 1-N: Implementering (GREEN phase)
- Testing-strategi (REFACTOR phase)
- Hver steg: konkret, testbart, estimert tid

**Template:** `core/templates/jira/3-løsning.md`

**Eksempel:**
```markdown
## Implementeringsplan

### Steg 0: Skriv tester (RED phase)
- [ ] `UserProfile.test.tsx` - Test ny validering (30 min)
- [ ] `UserController.test.kt` - Test nytt endpoint (30 min)

### Steg 1: Implementer backend (GREEN phase)
- [ ] Legg til felt i `User.kt` (15 min)
- [ ] Oppdater `UserController.kt` (30 min)
- [ ] Kjør tester - verifiser at de passerer (10 min)

### Steg 2: Implementer frontend (GREEN phase)
- [ ] Oppdater `UserProfile.tsx` (45 min)
- [ ] Oppdater `userApi.ts` (15 min)
- [ ] Kjør tester - verifiser at de passerer (10 min)

### Steg 3: Refaktorering og kvalitetssikring (REFACTOR phase)
- [ ] TypeScript check: `npx tsc --noEmit` (5 min)
- [ ] ESLint: `pnpm run eslint` (5 min)
- [ ] Alle tester: `pnpm test -- --run` (10 min)
```

### 4. status.md

**Innhold:**
- Fremdriftssporing
- Utfordringer og løsninger
- Tester (status, coverage)
- Deployment-status

**Template:** `core/templates/jira/4-status.md`

---

## Analyser impact

### Frontend vs Backend

Bruk `systems/melosys-web/api-mapping/` til å identifisere:
- Er dette en frontend-bug (parsing/visning)?
- Er dette en backend-bug (data/logikk)?
- Påvirker det begge lag?

### API-påvirkning

```markdown
## API-påvirkning

### Endret endpoint
- `GET /api/user/{id}` → Response-format endret
- Påvirkede frontend-filer:
  - `src/api/userApi.ts:12`
  - `src/components/UserProfile.tsx:45`
```

### Kompleksitet

**Enkel:**
- 1-2 filer påvirket
- Ingen API-endringer
- < 2 timer estimert arbeid

**Middels:**
- 3-5 filer påvirket
- Mindre API-endringer
- 2-8 timer estimert arbeid

**Kompleks:**
- > 5 filer påvirket
- Store API-endringer eller nye endpoints
- > 8 timer estimert arbeid
- Krever dypere resonnering (Extended Thinking)

---

## Referanser

- `core/docs/WORKFLOWS.md` - Komplett workflow-dokumentasjon
- `core/docs/DOCUMENTATION_STANDARD.md` - 4-fils struktur-standard
- `systems/melosys-web/api-mapping/API_MAPPING_GUIDE.md` - Frontend ↔ Backend mapping


---

# Skill: tdd-coach (Test-Driven Development)

> **Ekspertise:** Test-Driven Development metodikk

---

## Når å bruke denne skill

- Du skal implementere ny funksjonalitet
- Du skal refaktorere eksisterende kode
- Du skal sikre høy testdekning
- Du skal følge TDD-syklusen

---

## TDD-syklusen

### 1. RED PHASE

**Skriv tester først (basert på krav)**

```bash
# Steg 1: Skriv tester
# Steg 2: Kjør tester
pnpm test -- --run <testfil>
# Steg 3: Verifiser at tester FEILER
# Steg 4: Stopp og be om bekreftelse
```

**Hvorfor?**
- Sikrer at testene faktisk tester noe
- Forhindrer falske positiver
- Definerer forventet oppførsel før implementering

### 2. GREEN PHASE

**Implementer minimalt for å få testene til å passere**

```bash
# Steg 1: Implementer kode
# Steg 2: Kjør tester etter hvert steg
pnpm test -- --run <testfil>
# Steg 3: Verifiser at alle tester PASSERER
# Steg 4: Stopp og be om bekreftelse
```

**Hvorfor?**
- Fokuserer på enkleste løsning først
- Iterativ tilnærming
- Bygger tillit underveis

### 3. REFACTOR PHASE

**Forbedre koden (uten å endre oppførsel)**

```bash
# Steg 1: Refaktorer kode
# Steg 2: Kjør alle tester
pnpm test -- --run
# Steg 3: Kjør TypeScript check
npx tsc --noEmit
# Steg 4: Kjør ESLint
pnpm run eslint
# Steg 5: Verifiser at alt fortsatt passerer
```

**Hvorfor?**
- Forbedrer kodekvalitet
- Fjerner duplisering
- Sikrer at ingen regresjoner introduseres

---

## Testing-standarder

### Frontend (melosys-web)

- ✅ **Vitest** + **React Testing Library**
- ✅ `describe` + `it` struktur
- ✅ Mock eksterne avhengigheter
- ✅ Test happy path, edge cases, errors
- ✅ Målsetning: 80% coverage

### Backend (melosys-api)

- ✅ **JUnit 5** + **MockK**
- ✅ `@Test` annotations
- ✅ Mock eksterne dependencies
- ✅ Test domain logic, repository, controller
- ✅ Målsetning: 80% coverage

### E2E Tests

- ✅ **Playwright** for frontend E2E
- ✅ Test kritiske brukerflyter
- ✅ Kjør før deployment

---

## Best practices

### 1. Test Edge Cases

```typescript
describe('validateEmail', () => {
  it('should accept valid email', () => {
    expect(validateEmail('test@nav.no')).toBe(true);
  });

  it('should reject email without @', () => {
    expect(validateEmail('testnavno')).toBe(false);
  });

  it('should handle null gracefully', () => {
    expect(validateEmail(null)).toBe(false);
  });

  it('should handle empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

### 2. Mock External Dependencies

```typescript
import { vi } from 'vitest';
import { apiClient } from './api';

vi.mock('./api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

it('should fetch user data', async () => {
  apiClient.get.mockResolvedValue({ name: 'Test User' });
  const user = await fetchUser(123);
  expect(user.name).toBe('Test User');
});
```

### 3. Test Error Cases

```typescript
it('should handle API errors', async () => {
  apiClient.get.mockRejectedValue(new Error('Network error'));
  await expect(fetchUser(123)).rejects.toThrow('Network error');
});
```

---

## Referanser

- `core/docs/TESTING_RULES.md` - Fullstendig testing-regelverk
- `core/docs/WORKFLOWS.md` - TDD-workflow i kontekst av JIRA/TODO
- `systems/melosys-web/docs/KODESTANDARD.md` - Frontend testing-standarder


---

## Tilgjengelige kommandoer

### 🎫 Unified /aide-* kommandoer (anbefalt)

**Smart JIRA/TODO-deteksjon:**

```bash
# JIRA-arbeidsflyt (detekteres automatisk fra MELOSYS-* prefix)
/aide-opprett MELOSYS-XXXX           # Opprett dokumentstruktur
/aide-analyser MELOSYS-XXXX          # Analyser kodebase
/aide-løs MELOSYS-XXXX               # Implementer med TDD

# TODO-arbeidsflyt (med todo- prefix eller shorthand)
/aide-opprett todo-redux-form-migration Beskrivelse her
# → Genererer: todo-01-redux-form-migration

/aide-opprett todo Beskrivelse her   # Autogenerert slug
# → Genererer: todo-01-beskrivelse-her

/aide-analyser todo-01               # Analyser (shorthand)
/aide-løs todo-01                    # Implementer (shorthand)
```

**Format:**
- `/aide-opprett <id> [beskrivelse]` - Opprett dokumentstruktur (4 filer)
- `/aide-analyser <id>` - Analyser kodebase og identifiser påvirkede filer
- `/aide-løs <id>` - Implementer løsning med TDD

**ID-format:**
- JIRA: `MELOSYS-XXXX` (f.eks. MELOSYS-7890)
- TODO: `todo-XX` eller `todo-XX-slug` (f.eks. todo-01 eller todo-01-redux-migration)

### 🔧 Utility-kommandoer

**React-refaktorering:**
```bash
/aide-react-class-to-func <fil-path>
# Konverterer React class-komponent til functional component med hooks
```

**Test-generering:**
```bash
/aide-lag-tester <fil-path>
# Analyserer fil og genererer manglende enhetstester
```

### 🔐 JIRA Cookie-oppdatering

**Når JIRA-tilgang utløper:**
```bash
# Kjør i terminal (IKKE som slash command):
aide-jira-update-cookies
```

**Sympt på utløpt tilgang:**
- `aide-jira-fetch` returnerer 401 Unauthorized
- MCP JIRA-server feiler

**Hvordan fikse:**
1. Kjør `aide-jira-update-cookies` i terminal
2. Følg instruksjonene (kopiér cookies fra nettleser)
3. Prøv JIRA-operasjonen igjen

### Agents (spesialiserte agenter)

Claude Code har tilgang til spesialiserte agenter via Task tool:

**Tilgjengelige agenter:**
- `@agent-jira-analyzer` - Analyser JIRA-sak og opprett dokumentasjon
- `@agent-tdd-implementer` - Implementer løsning med TDD (RED → GREEN → REFACTOR)
- `@agent-test-coverage-improver` - Lag manglende tester og forbedre coverage
- `@agent-react-class-to-functional-converter` - Konverter React class til functional component

**Hvordan kalle:**
Slash commands delegerer automatisk til agents. Du trenger IKKE å kalle dem direkte.

---

## Videre lesing

**Fullstendig dokumentasjon:**
- [README.md](README.md) - Oversikt
- [INSTALL.md](INSTALL.md) - Installasjonsveiledning

**Workflows og regler:**
- [core/docs/WORKFLOWS.md](core/docs/WORKFLOWS.md) - JIRA/TODO/TDD workflows
- [core/docs/GIT_RULES.md](core/docs/GIT_RULES.md) - Git best practices
- [core/docs/TESTING_RULES.md](core/docs/TESTING_RULES.md) - Testing-standarder
- [core/docs/DOCUMENTATION_STANDARD.md](core/docs/DOCUMENTATION_STANDARD.md) - 4-fils struktur

**System-dokumentasjon:**
- [systems/melosys-web/docs/KODESTANDARD.md](systems/melosys-web/docs/KODESTANDARD.md) - Frontend-standarder
- [systems/melosys-api/README.md](systems/melosys-api/README.md) - Backend-dokumentasjon
- [systems/melosys-web/api-mapping/API_MAPPING_GUIDE.md](systems/melosys-web/api-mapping/API_MAPPING_GUIDE.md) - API-mapping

---

**Følg disse instruksjonene konsekvent for best resultat! 🚀**
