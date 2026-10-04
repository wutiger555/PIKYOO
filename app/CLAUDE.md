# PIKYOO app (Expo): notes for Claude

Read `AGENTS.md` here (Expo's own guidance: versioned docs, `npx expo install`, no hand edits to `ios/`/`android/`) and the repo's `CLAUDE.md` and `docs/APP.md`.

- **Own install.** `cd app && npm install`. The app is not an npm workspace: React Native pins an exact React version that differs from the website's. `packages/core` is imported from source as `@pikyoo/core/<file>` (tsconfig `paths`, Metro `watchFolders` in `metro.config.js`).
- **Run:** `npx expo start --ios` (Expo Go on the simulator). Native builds for the stores are local Xcode / Android Studio (docs/APP.md §6), not EAS cloud builds.
- **Verify:** `npx tsc --noEmit` (CI: `.github/workflows/app.yml`), then look at it in the simulator.
- **Same rules as the website:** the product decisions in the root `CLAUDE.md` apply (no private LINE contact, visitors see only the basics, photos tagged 示意照). Colours come from `src/ui/theme.ts`, which mirrors `web/src/styles/tokens.css`.
- **Data:** `src/data/catalog.tsx` loads the catalog through `@pikyoo/core/source/live` (or `demo`), like `web/src/lib/source.ts`. `app/.env` holds the public Supabase URL and publishable key and sets `EXPO_PUBLIC_DATA_SOURCE=live`; unset or `demo` shows mock data. Demo photos load from the demo website (`DEMO_SITE`).
- **Parity with the website.** App screens port the website's screens section for section; each screen's doc comment names its website counterpart (e.g. `CoachPageScreen`). Shared rules (filters, contact check, booking calendar) live in `packages/core`, never copied. What the website keeps in `lib/demo-store.tsx` lives in `src/data/session.tsx`.
