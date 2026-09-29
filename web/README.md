# PIKYOO 匹友 — Web (MVP)

Next.js (App Router) + TypeScript + Tailwind v4, per `docs/PRD.md` §9. The screens implement the Claude Design handoff ("螢光球 × 碳纖維") and run on **mock data**; Supabase / LINE LIFF come next.

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

## Routes

| Route | Screen |
| --- | --- |
| `/` | 探索首頁 (F7) |
| `/games` | 球局列表＋快速篩選＋篩選面板 (F2) |
| `/games/[id]` | 球局詳情 → 確認報名／加入候補 (sheet) |
| `/games/[id]/success` | 報名成功／已加入候補 |
| `/coaches` | 找教練、比較 2–3 位 (F3-3) |
| `/coaches/[id]` | 教練頁（招生頁）(F3-4) — only `mia` has a full profile |
| `/coaches/[id]/book?plan=` | 預約：一頁完成 (F3-7) |
| `/me/booking` | 預約狀態與付款；`?demo=pending\|confirmed` seeds a booking |
| `/coach`, `/coach/payments`, `/coach/profile` | 教練端：今天、收款對帳＋收款設定、我的招生頁 (F5) |
| `/design` | Style guide: brand, logo, foundations, components, and every flow with its PRD mapping |

## Structure

- `src/styles/tokens.css` — design tokens. They are Tailwind theme values too (`bg-accent`, `text-muted`, `border-line`, `rounded-md`, `font-num`, `bg-level-3`).
- `src/styles/pikyoo.css` — design-system classes (`.btn`, `.ticket`, `.seats`, `.level`, `.cred`, `.chip`, `.sheet`, `.tabbar`, `.sticky-cta`…), ported 1:1 from the handoff `styles.css`. Tailwind preflight is intentionally **off** so these render exactly as designed.
- `src/styles/screens.css`, `coach.css`, `design.css` — screen-level styles from the prototypes.
- `src/components/pk/` — `Icon` (pickleball icon set), `PkMark`/`PkBall` (logo), `LevelChip`, `Cred`, `Sprout`, `Status`, `CourtArt`, `GameTicket`, `Seats`, `AppBar`, `Sheet`, `TabBar`, `LevelPicker`, `Toast`.
- `src/features/` — screens (`games/`, `coaches/`, `console/`).
- `src/lib/data/` — mock data; `src/lib/types.ts` follows the PRD §7 data model.
- `src/lib/demo-store.tsx` — in-memory client state (my registrations, filters, compare list, booking, coach requests/payments). It survives client navigation and resets on reload; it is the seam where Supabase queries go.

See `../docs/DESIGN_SYSTEM.md` for the design rules.
