# PIKYOO 匹友: project notes for Claude

A pickleball platform for 雙北 (Taipei / New Taipei): find coaches and book lessons, find games, find courts. Right now it is a **clickable demo on mock data**, moving to real data on Supabase in stages B1–B8 (`docs/BACKEND.md`). LINE Login/LIFF setup is in `docs/SETUP.md`.

- **Live:** <https://pikyoo.vercel.app> is `main`, auto-deployed by Vercel (project `pikyoo`, root directory `web/`).
- **Code:** npm workspaces from the repo root (run `npm install` there; the only lockfile is the root `package-lock.json`). `packages/core/` is plain TypeScript shared with the future app (`docs/APP.md` §3): types, mock data, `format`, `contact`; import it as `@pikyoo/core/<file>`. `web/` (Next.js App Router + TypeScript + Tailwind v4). Its own notes are in `web/CLAUDE.md` / `web/AGENTS.md`. Read the Next.js docs in `web/node_modules/next/dist/docs/` before relying on memory, because this Next.js version has breaking changes.
- **Docs:** `docs/PRD.md` (spec, F-numbers), `docs/PLAN.md` (strategy), `docs/BUSINESS_MODEL.md` (pricing and revenue draft), `docs/DESIGN_SYSTEM.md`, `docs/DESKTOP.md` (desktop layouts and decisions), `docs/PHOTOS.md` (photo sources), `docs/SETUP.md`, `docs/BACKEND.md` (real data: architecture, schema, stages), `docs/APP.md` (native app plan: React Native + Expo, Phase 4).
- **Database:** `supabase/` at the repo root: `migrations/` (tables, RLS, RPC), `seed.sql` (generated), `dev/` (plain-Postgres checks).

## Working with the owner

- The owner writes in Traditional Chinese (Taiwan). Reply in the same language, in plain terms.
- **Workflow (decided 2026-09-30):**
  1. Work on the session branch.
  2. Verify (see below).
  3. Open a PR and **merge it to `main` yourself** once checks pass.
  4. Point the owner at the live URL.

  They don't want to review a separate preview URL for every change. Keep one PR per change set.
- **Records:** after each merged change, add a row to the 更新紀錄 table in `README.md`. If the change finishes a step on the road to the native app, tick it in the progress table in `docs/APP.md` §8 and move the 目前位置 line. When a product decision changes, update the matching doc: PRD F-rows, `DESKTOP.md` §9 onward, `PHOTOS.md`.

## Product decisions to keep

- **No private LINE contact between students and coaches.** It invites off-platform booking. Use the coach page's public 問與答 (PRD F3-11). `packages/core/src/contact.ts` blocks phone, email, LINE/IG handles and 「私訊我」. LINE is only PIKYOO's own official account, for notifications. Pickup-game hosts may still use a LINE contact.
- **Visitors see only the basics.** On a coach page, a visitor sees photos, credentials, tagline, stats, plans and prices, and the bio. Everything else sits behind a sign-in panel (`GUEST_SECTIONS` in `CoachPageScreen.tsx`). Booking, joining a group and asking all open `LoginSheet` (用 LINE 登入／註冊). Signed-out visitors get the landing home page. Content is not hidden completely, so the pages stay useful for SEO and IG links.
- **Photos** are Unsplash-License stock (mostly Asian players, indoor courts), tagged 「示意照」. They are never presented as the real coach. List every file with source and photographer in `docs/PHOTOS.md`.
- **Phone first.** The phone layout must not change when desktop work is done. Desktop is ≥1024px. Tablet (640–1023px) is the phone layout widened to 720px.

- **Environments (decided 2026-09-30):** production is the `pikyoo` Vercel project + Supabase `pikyoo-dev`; the demo is a separate Vercel project `pikyoo-demo`. Current progress and owner to-dos: `docs/BACKEND.md` §13. Database work goes through the Supabase MCP when it is connected (§9.4).
- **Simple first (decided 2026-10-04).** The first version must work and be easy to use; build the smallest version of each feature that lets people finish the task, and leave complex extras (group-lesson gathering rules, AI parsing, automation) until real users need them (`docs/PLAN.md` D7). The native app will be built, after the website is live with real users (D8, `docs/APP.md`).
- **Keep the demo.** The owner demos PIKYOO to coaches on <https://pikyoo-demo.vercel.app>, so it must stay complete and polished. One codebase serves both: `NEXT_PUBLIC_DATA_SOURCE=demo` (mock data, the default when unset) and `live` (Supabase). The demo gets its own URL and must keep working. When a feature changes, update the mock data and the live adapter together (`docs/BACKEND.md` §1.3).

## Code conventions

- UI copy is Traditional Chinese (Taiwan). Code, comments and commit messages are English. Match the surrounding style: dense one-line JSX, short doc comments that say why.
- **Desktop opt-in:**
  - Put `.dk` on a screen's scroller (`scroll dk …`) and render `<TopNav />` (+ `<Crumbs />`) inside it. All desktop CSS lives in `styles/desktop.css`.
  - Helpers: `.dk-only` / `.mb-only` show or hide elements per layout; `.dk-narrow` is a centred 760px column; `.dk-float` makes the bottom CTA float.
  - Console pages use `ConsoleFrame`.
- **Demo state** lives in `lib/demo-store.tsx` (in memory, resets on reload). `signedIn` defaults to true; 登出 in 我的 or in the desktop avatar menu shows the visitor view.
- **Real sign-in** (LINE → Supabase) turns on only in live mode with `NEXT_PUBLIC_LIFF_ID` set (`realAuth` in `lib/env.ts`); otherwise sign-in stays the demo toggle. Screens sign in, out, save the profile and delete the account through `useAccount()` (`lib/use-account.ts`), never by flipping `signedIn` directly. Details: `docs/BACKEND.md` §5.

## Verify before pushing

```bash
cd web && npm run build && npx tsc --noEmit && npm run lint   # build first: it generates the PageProps/LayoutProps types
```

Then look at the pages. In cloud sessions Playwright is installed globally (`$(npm root -g)/playwright`, Chromium preinstalled); on the owner's Mac it is not, so use the built-in browser pane instead. Run it against `npx next start -p <port>` at 1280 and 390 wide (plus 1024 and 768 for layout work), and check for console errors and horizontal scroll. Before restarting, kill any old `next-server`: a stale server keeps the port and serves chunks that no longer exist.

For database changes: add a new file under `supabase/migrations/` (never edit an applied one), then `cd web && npm run db:seed && npm run db:check`. Add a check to `supabase/dev/checks.sql` for every new rule (who can see or change what). `packages/core/src/contact.ts` and `public.contact_kind()` implement the same rule: change both.

## Pitfalls already hit

- **The owner's local checkout is inside Box** (`~/Library/CloudStorage/Box-Box/...`). File reads, builds and git (`commit --amend`, `push`) can hang there. Work in a clone or worktree outside Box (e.g. the session scratchpad), and fall back to the GitHub API (`gh api .../git/commits`) if local git stalls.
- **Switching production to live data:** check the PR's Vercel Preview URL in live mode before merging, then check `pikyoo.vercel.app` right after. B1 (#11) took production down because the Vercel env didn't work in production; revert first, debug after.
- A route with `generateStaticParams` is static/ISR and cannot call `connection()` (`DYNAMIC_SERVER_USAGE`). Live-data pages must not export it.
- A `Sheet` rendered **inside** a phone scroller makes the page jump when its input takes focus. Render sheets after the scroller (see `AskSheet`, `LoginSheet` usage).
- Elements that sit **above** the phone scroller (list heads, the host mode switch) would land above `TopNav` on desktop. Render a desktop copy inside the scroller and hide the outer one at ≥1024px.
- Desktop rules written as `.dk .x` also match descendants: the console editor's phone preview sits inside a `.dk` page. Coach-page rules are therefore scoped `.dk.cp`. When `.dk` and another class are on the same element, write them together (`.dk.cd`), not as descendant selectors.
- Inline `style={{ display / margin }}` beats utility classes such as `.mb-only` or the narrow column. Wrap the element, or override with a targeted rule.
