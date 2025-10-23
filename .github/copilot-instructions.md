# Code Review Instructions for Copilot

## Generelle prinsipper
- Alle kommentarer skal skrives på **NORSK**
- Foreslå konkrete kodeendringer der det er relevant
- Fokuser på korrekthet, ytelse, sikkerhet og vedlikeholdbarhet
- Følg prosjektets filosofi: **ikke komplikere unødvendig** - ideelt sett like mange linjer slettet som lagt til

## Review-struktur

### 1. Oversikt
- Beskriv hva PR-en gjør i 2-3 setninger
- Identifiser hvilke deler av kodebasen som påvirkes

### 2. Kodeanalyse

#### a) Kodekvalitet
- ✅ **TypeScript-bruk**: Ny kode skal skrives i TypeScript (ADR-3)
- ✅ **Type-sikkerhet**: Unngå `any`, bruk spesifikke typer
- ✅ **Filstørrelse**: Maks 400 linjer per fil (ESLint-regel)
- ✅ **Funksjoner**: Hold dem korte og fokuserte på én oppgave
- ✅ **Props**: Definer interface for alle React-komponenter

#### b) React-mønstre
- ✅ **Funksjonelle komponenter**: Bruk funksjonelle komponenter med hooks
- ✅ **Hooks**: Følg React hooks regler
  - `useMemo` for beregninger som gjenbrukes
  - `useCallback` for funksjoner som sendes som props
  - Custom hooks for gjenbrukbar logikk
- ✅ **Props**: Definer default-verdier der det gir mening
- ✅ **JSX**: Bruk `react-jsx` runtime (ikke `React.createElement`)

Eksempel på god komponentstruktur:
```typescript
interface EnkeltDatoProps {
  dato?: string | null;
  visTidspunkt?: boolean;
  defaultValue?: string;
}

export function EnkeltDato({
  dato = "",
  visTidspunkt = false,
  defaultValue = "-"
}: EnkeltDatoProps) {
  const lesbarDato = useMemo(() =>
    dato ? formaterDato(dato, visTidspunkt) : defaultValue,
    [dato, visTidspunkt, defaultValue]
  );

  return dato ? (
    <time dateTime={dato}>{lesbarDato}</time>
  ) : (
    <span>{defaultValue}</span>
  );
}
```

#### c) Redux-mønstre (Ducks-mønster)
- ✅ **Struktur**: Følg ducks-mønsteret med co-localized filer:
  - `actions.ts` - Action creators
  - `operations.ts` - Redux-thunk operasjoner
  - `reducers.ts` - Reducer med initialState
  - `selectors.ts` - Reselect selectors
  - `types.ts` - Action type-konstanter
  - `index.ts` - Eksporter alt
- ✅ **State-form**: Typisk `{ status, data }` med status: NOT_STARTED, PENDING, OK, ERROR
- ✅ **Selectors**: Bruk Reselect for memoized selectors
- ✅ **Async**: Bruk redux-thunk for asynkrone operasjoner

#### d) Form-håndtering
- ✅ **React Hook Form**: Bruk for form state management
- ✅ **Yup**: Bruk for validering
- ✅ **Nav Aksel**: Bruk Nav Aksel design system komponenter

#### e) GraphQL
- ✅ **Code Generator**: Generer typer automatisk med GraphQL Code Generator
- ✅ **Apollo Client**: Bruk for GraphQL queries/mutations
- ✅ **Hooks**: Bruk auto-genererte hooks fra codegen

#### f) Kodestandard
- ✅ **Prettier**: Koden må være formatert (120 chars per linje)
- ✅ **ESLint**: Følg prosjektets ESLint-regler
  - `prefer-const` over `let`
  - Ingen `var`
  - Ingen `console.log` i produksjonskode
  - `===` over `==`
  - Arrow functions med spacing
- ✅ **Språk**: Norsk for variable-, funksjons- og komponentnavn

#### g) Feilhåndtering
- ✅ **Optional chaining**: Bruk `?.` for trygg property access
- ✅ **Nullish coalescing**: Bruk `??` for default-verdier
- ✅ **Type guards**: Bruk for runtime type-sjekker

### 3. Testing

#### a) Enhetstester (Vitest)
- ⚠️ **Mangler tester?**: Påpek hvis det mangler tester for ny funksjonalitet
- ✅ **Testing Library**: Bruk `@testing-library/react` for komponenttesting
- ✅ **Queries**: Bruk riktige queries (role > text > testId)
- ✅ **Mocking**: Mock eksterne avhengigheter (API, localStorage, etc.)
- ✅ **Async**: Test asynkron oppførsel med `waitFor`, `findBy*`

Test-eksempel:
```typescript
import { render, screen } from '@testing-library/react';
import { EnkeltDato } from './enkeltDato';

describe('EnkeltDato', () => {
  it('viser formatert dato når dato er gitt', () => {
    render(<EnkeltDato dato="2025-01-15" />);
    expect(screen.getByText('15.01.2025')).toBeInTheDocument();
  });

  it('viser default-verdi når dato mangler', () => {
    render(<EnkeltDato defaultValue="Ingen dato" />);
    expect(screen.getByText('Ingen dato')).toBeInTheDocument();
  });
});
```

#### b) E2E-tester (Playwright)
- ✅ **Kritisk funksjonalitet**: Vurder om endringer krever E2E-tester
- ✅ **Test-kategorier**: Plasser i riktig kategori (basic, opprett-ny-sak, etc.)
- ✅ **Accessibility**: Bruk Axe for a11y-testing

### 4. Sikkerhet og ytelse

#### a) Sikkerhet
- 🛡️ **XSS**: Unngå `dangerouslySetInnerHTML`
- 🛡️ **Sanitering**: Valider og sanitér brukerinput
- 🛡️ **Autentisering**: Sjekk at sikker data er beskyttet
- 🛡️ **Secrets**: Aldri commit secrets (.env-filer, tokens, etc.)

#### b) Ytelse
- ⚡ **Memoization**: Bruk `useMemo` og `useCallback` for tunge beregninger
- ⚡ **Re-renders**: Unngå unødvendige re-renders
- ⚡ **Bundle size**: Vurder bundle-størrelse ved import av store biblioteker
- ⚡ **Lazy loading**: Vurder code-splitting for store komponenter

### 5. Dokumentasjon
- 📝 **Kommentarer**: Skriv kommentarer på norsk for kompleks forretningslogikk
- 📝 **JSDoc**: Dokumenter public APIs
- 📝 **README**: Oppdater hvis arkitektur eller setup endres

Eksempel på god kommentar:
```typescript
// For delt grunnlag må vi tillate å legge til perioder selv med pliktige bestemmelser
// fordi brukeren trenger å kunne registrere flere perioder manuelt
const erDeltGrunnlag =
  harTrygdeavgiftFraAvgiftssystemet &&
  !!initiellData.aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;
```

### 6. Prosjektspesifikke konvensjoner

#### Mappestruktur
- `src/sider/` - Hele sider (ikke nøstbare)
- `src/felleskomponenter/` - Gjenbrukbare komponenter
- `src/ducks/` - Redux-moduler
- `src/services/` - API-kall
- `src/hooks/` - Custom React hooks
- `src/utils/` - Hjelpefunksjoner

#### Navngivning
- **Komponenter**: camelCase filer (e.g., `enkeltDato.tsx`)
- **Komponenter**: PascalCase for export (e.g., `export function EnkeltDato`)
- **Variabler/funksjoner**: camelCase
- **Konstanter**: UPPER_SNAKE_CASE
- **Redux actions**: UPPER_SNAKE_CASE (e.g., `FETCH_DOKUMENTER_REQUEST`)

#### Imports
- Bruk path aliases der tilgjengelig (AppTypes, Domene, melosys-api)
- Grupper imports: external → internal → relative

### 7. Review-format

Strukturer din review slik:

```markdown
## Code Review: [PR tittel]

### 📋 Oversikt
[Kort beskrivelse av hva PR-en gjør]

### ✅ Hva som fungerer bra
- [Positivt punkt 1]
- [Positivt punkt 2]

### 🔍 Kodeanalyse

**[fil:linjenummer]**
\`\`\`typescript
[kode]
\`\`\`
✅/⚠️/❌ [Kommentar på norsk]

### 💡 Forslag til forbedringer

1. **[Kategori]** (fil:linjenummer):
   \`\`\`typescript
   // Før
   [gammel kode]

   // Etter
   [foreslått kode]
   \`\`\`
   [Forklaring på norsk]

### 🧪 Testing
- ✅ [Testet/OK]
- ⚠️ [Mangler tester for X]
- ⚠️ Forslag: [Spesifikk test som bør legges til]

### 🛡️ Sikkerhet og ytelse
- [Vurdering av sikkerhet]
- [Vurdering av ytelse]

### 📊 Vurdering
**Samlet score: X/10**

[Kort oppsummering]
[Anbefaling: Godkjenn / Godkjenn med kommentarer / Trenger endringer]
```

## Eksempler på gode kommentarer

### ✅ Bra kommentar med forslag:
```markdown
**medlemskapsperiodeSkjema.tsx:172**
\`\`\`typescript
const erDeltGrunnlag =
  harTrygdeavgiftFraAvgiftssystemet &&
  !!initiellData.aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger;
\`\`\`

⚠️ **Forslag**: Vurder å bruke `useMemo` for konsistens med `medlemskapstypeErPliktig` over:

\`\`\`typescript
const erDeltGrunnlag = useMemo(() =>
  harTrygdeavgiftFraAvgiftssystemet &&
  !!initiellData.aarsavregningResponse?.tidligereTrygdeavgiftsGrunnlagsopplysninger,
  [harTrygdeavgiftFraAvgiftssystemet, initiellData.aarsavregningResponse]
);
\`\`\`

Dette gjør avhengighetene eksplisitte og følger samme mønster som resten av komponenten.
```

### ✅ Bra kommentar om manglende tester:
```markdown
⚠️ **Mangler tester**: Ingen enhetstester for den nye `erDeltGrunnlag`-logikken.

**Forslag til test**:
\`\`\`typescript
describe('AarsavregningUtenEllerDeltGrunnlagForm', () => {
  it('viser "Legg til periode"-knapp når erDeltGrunnlag er true', () => {
    const props = {
      harTrygdeavgiftFraAvgiftssystemet: true,
      initiellData: {
        aarsavregningResponse: {
          tidligereTrygdeavgiftsGrunnlagsopplysninger: [{ ... }]
        }
      }
    };

    render(<AarsavregningUtenEllerDeltGrunnlagForm {...props} />);
    expect(screen.getByText('Legg til periode')).toBeInTheDocument();
  });
});
\`\`\`
```

## Sjekkliste for hver review

- [ ] PR-beskrivelsen er klar og forklarer hvorfor endringen er nødvendig
- [ ] Koden følger prosjektets TypeScript- og React-mønstre
- [ ] Ingen `any`-typer uten god grunn
- [ ] Props har definerte interfaces med default-verdier der relevant
- [ ] `useMemo` og `useCallback` brukes riktig
- [ ] Koden er formatert med Prettier
- [ ] Ingen ESLint-feil
- [ ] Tester dekker ny funksjonalitet
- [ ] Ingen sikkerhetsproblemer (XSS, secrets, etc.)
- [ ] Ingen ytelsesproblem (unødvendige re-renders, tunge operasjoner)
- [ ] Koden er enkel og ikke overkomplisert
- [ ] Kommentarer på norsk for kompleks logikk
- [ ] Navngivning følger prosjektets konvensjoner

## Vær konstruktiv

- Gi spesifikke, handlingsdyktige tilbakemeldinger
- Foreslå konkrete løsninger, ikke bare påpek problemer
- Være positiv og oppmuntrende - påpek hva som er bra
- Fokuser på de viktigste problemene først
- Husk at målet er å lære og forbedre, ikke å kritisere
