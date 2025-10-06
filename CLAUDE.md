# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Melosys is a membership and law selection system (Medlems og Lovvalgssystem) built as a React/Redux single-page application with TypeScript. The application handles social security law selection for individuals working across Nordic and EU/EEA countries.

## Development Environment Setup

### Prerequisites
- Node.js with pnpm package manager
- GitHub Personal Access Token (PAT) with `repo` and `read:packages` permissions
- Configure PAT in `~/.npmrc`:
  ```
  //npm.pkg.github.com/:_authToken=${NPM_TOKEN}
  ```

### Common Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (localhost:3000)
pnpm start

# Start with Q1 environment config
pnpm start:q1

# Start with Q2 environment config  
pnpm start:q2

# Build for production
pnpm build

# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI mode
pnpm test:e2e:ui

# Lint code
pnpm eslint

# Format code
pnpm prettier:write

# Check formatting
pnpm prettier:check

# Generate GraphQL types and hooks
pnpm generate-graphql

# Run a single test file
pnpm test src/path/to/test.test.ts
```

## High-Level Architecture

### Frontend Stack
- **React 19** with Redux for state management
- **TypeScript** for new code (legacy JavaScript still exists)
- **Vite** as build tool and dev server
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **GraphQL** with Apollo Client for API communication
- **Azure AD (MSAL)** for authentication
- **NAV Design System** (@navikt/ds-react) for UI components

### Project Structure

```
src/
├── sider/              # Page components (hovedsider)
│   ├── forside/        # Landing page
│   ├── sok/            # Search functionality
│   ├── journalforing/  # Journal management
│   └── ...             # Other main pages
├── felleskomponenter/  # Shared/reusable components
├── ducks/              # Redux modules (actions, reducers, selectors)
│   └── [module]/       # Each module follows ducks pattern
├── graphql/            # GraphQL queries and generated types
├── auth/               # Authentication configuration
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── kodeverk/           # Code tables and constants
```

### State Management (Redux Ducks Pattern)

Each module in `src/ducks/` contains:
- `index.ts/js` - Reducer export
- `actions.ts/js` - Action creators
- `operations.ts/jsx` - Thunks/async operations  
- `reducers.ts/js` - Reducer logic
- `selectors.ts/js` - State selectors
- `types.ts/js` - TypeScript types

### API Integration

The application communicates with three backend services:
- **melosys-api** (port 8080) - Main backend API
- **trygdeavtale-flyt** (port 8088) - Social security agreement workflow
- **faktureringskomponenten** (port 8084) - Billing component

### GraphQL Code Generation

1. Create `.gql` files with queries/mutations in component directories
2. Ensure melosys-api is running locally
3. Add authentication cookie to `src/graphql/codegen.yml`
4. Run `pnpm generate-graphql` to generate TypeScript types and React hooks

### Testing Strategy

- **Unit Tests**: Vitest with React Testing Library
  - Test files: `*.test.{ts,tsx,js,jsx}` or `*.spec.{ts,tsx,js,jsx}`
  - Located alongside source files
  
- **E2E Tests**: Playwright
  - Test files in `tests/e2e/specs/`
  - Page objects in `tests/e2e/pages/`
  - Includes accessibility testing with Axe

### Code Style Guidelines

- **TypeScript** for all new code
- **ESLint** configuration enforces:
  - Max 400 lines per file
  - Prettier formatting
  - No console.log statements (except in tests)
  - React hooks rules
- **Component conventions**:
  - Follow existing patterns in neighboring files
  - Use NAV Design System components
  - Look at existing components before creating new ones

### Key Technical Decisions

1. **TypeScript Migration** - Gradual migration from JavaScript to TypeScript
2. **NAV Frontend** - Using NAV's design system for consistency
3. **GraphQL** - Adopted for better type safety and developer experience
4. **Redux Ducks** - Modular organization of Redux code
5. **Vite** - Modern build tool for faster development

### Important Notes

- Application is progressively migrating from JavaScript to TypeScript
- Redux Form is still used in legacy code, but new forms should use React Hook Form
- Always check existing patterns before implementing new features
- The application handles sensitive personal data - security is paramount
- Feature toggles are managed through the `featuretoggle` Redux module

### Deployment

- Automatic deployment to dev environment on push to `master` branch
- Manual deployment available via GitHub Actions
- Deployed as nginx container in NAIS platform
- Configuration files in `nais/` directory