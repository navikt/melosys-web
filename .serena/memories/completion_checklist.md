# Completion Checklist

- If code touched: `pnpm eslint` and `pnpm prettier:check`.
- If logic changed: `pnpm test`.
- If E2E-relevant: `pnpm test:e2e` or `pnpm test:e2e:ui`.
- If GraphQL updates: `pnpm generate-graphql`.