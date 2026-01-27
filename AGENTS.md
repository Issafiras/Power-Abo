# Repository Guidelines

## Project Structure & Module Organization
This repository contains a React + Vite frontend with a small Node/Express backend.

- `src/`: Frontend source (React components, hooks, context, utilities).
- `src/features/`, `src/components/`: Feature modules and UI building blocks.
- `src/utils/`: Calculation and storage logic (many unit tests live here).
- `src/test/`: Vitest setup (see `src/test/setup.js`).
- `public/`: Static assets served by Vite.
- `dist/`: Production build output (generated).
- `server/`: Backend server (`server/src` with routes/controllers/middleware).
- `Logo'er/`: Brand assets.

## Build, Test, and Development Commands
Frontend (from repo root):
- `npm install`: Install dependencies.
- `npm run dev`: Start Vite dev server.
- `npm run build`: Build production assets into `dist/`.
- `npm run preview`: Serve the `dist/` build locally.
- `npm run lint`: Run ESLint (React + hooks rules).
- `npm run test`: Run Vitest in watch mode.
- `npm run test:ui`: Run Vitest with the UI runner.
- `npm run test:coverage`: Run tests with coverage output.

Backend (from `server/`):
- `npm install`: Install server dependencies.
- `npm run dev`: Start server with nodemon.
- `npm start`: Run server in production mode.

## Coding Style & Naming Conventions
- Use 2-space indentation (match existing JS/JSX files).
- Components are PascalCase (e.g., `StreamingSelector.jsx`), hooks are `useX` (e.g., `useAppState.js`).
- Favor `*.test.js` / `*.test.jsx` for test files.
- ESLint rules are defined in `.eslintrc.cjs`; run `npm run lint` before committing.

## Testing Guidelines
- Test framework: Vitest with Testing Library and JSDOM.
- Test files live alongside source (e.g., `src/utils/calculations.test.js`).
- Coverage is configured via `vitest.config.js` (use `npm run test:coverage`).

## Commit & Pull Request Guidelines
- Commits follow a light conventional pattern: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` (case varies in history; keep consistent within a PR).
- Pull requests should include a clear description, linked issue (if applicable), and UI screenshots for visual changes.
- Call out backend changes separately when they affect the API contract.

## Branching & Release Notes
- Use short, scoped branches like `feat/mobile-sticky-bar` or `fix/pricing-rounding`.
- Keep releases small; bump version in `package.json` and note highlights in `README.md` when shipping.

## QA Checklist (Before PR)
- Run `npm run lint` and `npm run test`.
- Spot-check mobile layout, keyboard shortcuts, and offline behavior.
- Verify calculation outputs for a few known scenarios.

## Text, Labels, and Data Updates
- UI text and constants live under `src/constants/` and `src/data/` (update both when changing plan names or prices).
- Prefer localized copy changes near the feature file to keep context.

## API Contract Notes
- Frontend expects the server base at `/api/v1` (see `server/README.md`).
- If you add or change endpoints, update `server/src/routes` and document in `server/README.md`.

## Security & Configuration Tips
- Copy `.env.example` to `.env` for local setup when needed.
- Server defaults to `PORT=3000`; document any new environment variables in `server/README.md`.
