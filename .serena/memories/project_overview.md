# Melosys Web Project Overview

- Purpose: Frontend for Melosys (Medlems- og lovvalgssystem).
- Stack: React + Redux, Vite, TypeScript (new code should be TS), Vitest for unit tests, Playwright for E2E, GraphQL codegen.
- Key deps: React 19, Redux, React Router (v5), Apollo Client, NAV design system (@navikt/ds-react).
- Structure (src):
  - `src/sider`: page-level screens
  - `src/felleskomponenter`: shared components
  - `src/ducks`, `src/store.js`, `src/reducer.ts`: state management
  - `src/graphql`: GraphQL and codegen
  - `src/services`, `src/utils`, `src/hooks`, etc.