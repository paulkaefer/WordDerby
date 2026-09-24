# WordDerby

A playful, multi-word take on Hangman: guess letters to help a cartoon
skater complete 1–4 hidden words before the roller rink closes for the
night. See [specs/001-wordderby/spec.md](specs/001-wordderby/spec.md) for
the full feature spec and [.specify/memory/constitution.md](.specify/memory/constitution.md)
for the project's non-negotiable design principles.

## Getting started

```powershell
npm install
npm run dev       # start the local dev server
npm test          # run the unit/component test suite once
npm run test:watch
npm run build      # type-check + production build
npm run lint
```

## Project structure

- `src/engine/` — pure, UI-independent game logic (`gameEngine`, `rinkClock`,
  `wordPool`, `dailyPuzzle`, `scoring`) with unit tests in `tests/engine/`.
- `src/persistence/` — round/profile persistence via `localStorage`.
- `src/notifications/` — opt-in reminder scheduling.
- `src/ui/` — React components, screens, and shared theme.
- `specs/001-wordderby/` — spec, plan, data model, contracts, and tasks for
  this feature.
