Install deps: `pnpm install` (pnpm is enforced via `npx only-allow pnpm`).
Local dev (against local API): `pnpm start` which generates `.local.env` and runs `vite` dev server.
Dev against q1/q2 APIs: `pnpm start:q1` / `pnpm start:q2` (generates env files and runs dev server with Azure AD login).
Preview build: `pnpm serve` (after build) or `pnpm serve:js` to run Vite preview only.
Build for prod: `pnpm build` (runs TypeScript check and `vite build`).
Unit tests: `pnpm test` (Vitest) or `pnpm test:coverage` for coverage.
E2E tests: `pnpm run test:e2e` and `pnpm run test:e2e:ui` for UI mode.
Lint: `pnpm eslint` or staged via `pnpm eslint:staged` through lint-staged/husky.
Format: `pnpm prettier:write` and check via `pnpm prettier:check`.
GraphQL codegen: `pnpm generate-graphql`.
Playwright browsers: installed automatically postinstall; rerun `npx playwright install` if missing.