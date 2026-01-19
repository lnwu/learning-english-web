---
applyTo: "**"
---

# AI Agent Instructions

## Goal
Make minimal, accurate changes that follow existing patterns and keep documentation in sync with the codebase.

## Stack Snapshot
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + Tailwind CSS v4 + Radix UI
- **Language**: TypeScript (strict)
- **State**: MobX (`observer`, `makeAutoObservable`)
- **Auth**: NextAuth.js v5 (Google OAuth)
- **Storage**: Firebase Firestore + offline sync queue (LocalStorage)

## Key Paths
- `src/app/**` — pages and layouts (App Router)
- `src/components/**` — UI and feature components
- `src/hooks/**` — app hooks (`useFirestoreWords` is primary)
- `src/lib/**` — shared utilities (use `cn` for classes)
- `docs/**` — architecture, API, storage, and algorithms

## Primary Data Flow
- **Words**: use `useFirestoreWords` for CRUD + mastery tracking + sync state.
- **Legacy**: `useWords` (LocalStorage-only) is for fallback/migration.
- **Offline**: sync queue uses LocalStorage; surface `pendingCount` and `syncing`.

## Do / Don’t
- **Do** use `observer` for MobX state and access observables directly.
- **Don’t** use `useMemo`/`useCallback` with MobX observables.
- **Do** add `"use client"` only when required (hooks, events, browser APIs).
- **Do** prefer existing UI components (Button, Input, Dialog, Toast, FrequencyBar).
- **Do** handle API errors with `try/catch` and user-friendly feedback.
- **Don’t** introduce new deps unless necessary.

## Component/Page/Hook/Utility Rules
- **Pages (`src/app/**`)**: Server components by default; use `"use client"` only when needed.
- **Components (`src/components/**`)**: Keep small and focused; prefer existing UI primitives.
- **Hooks (`src/hooks/**`)**: One hook per file; `useFirestoreWords` is primary; avoid `useMemo`/`useCallback` with MobX observables.
- **Utilities (`src/lib/**`)**: Keep functions pure; use `cn()` for class merging.

## Documentation Updates
- Keep README and docs aligned with current routes and storage (Firestore-first).
- When changing behavior, update the relevant doc in `docs/`.

## Style Reminders
- 2-space indentation, semicolons, and Tailwind utility classes.
- Keep changes focused and avoid unrelated refactors.

## Browser MCP
- Avoid repeated navigation; prefer taking a screenshot directly to check UI changes.
