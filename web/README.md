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
| `/` | 首頁：想上什麼課、適合你的教練、近期可約、揪朋友一起上 (F7) |
| `/games` | 球局列表＋快速篩選＋篩選面板 (F2) |
| `/games/[id]` | 球局詳情 → 確認報名／加入候補 (sheet) |
| `/games/[id]/success` | 報名成功／已加入候補 |
| `/games/new` | 開團：AI 一貼成局／自己填 → 發布 → 分享 LINE Flex 卡片 (F2-7/8/9) |
| `/learn`, `/learn/level-check` | 新手專區 (F3-1)、程度自評 (F3-2) |
| `/courts`, `/courts/[id]` | 球場列表＋地圖、球場詳情 (F4) |
| `/me` | 我的：檔案、出席紀錄、我的球局／預約、設定 (F1-4, F8) |
| `/welcome` | Onboarding 3 步 (F1-3) |
| `/coaches` | 找教練、比較 2–3 位 (F3-3) |
| `/coaches/[id]` | 教練頁（招生頁）：封面照、相簿、匹克球檔案、可約時段 (F3-4) |
| `/coaches/[id]/book?plan=&with=friends` | 預約：一頁完成；`with=friends` 直接進揪朋友模式 (F3-7, F3-10) |
| `/groups/[id]`, `/groups/[id]/invite` | 揪朋友一起上：發起人頁、朋友收到的邀請頁 (F3-10)；demo 預設有 `grp1` |
| `/me/lessons` | 我的課：即將上課／揪團中／上過的 |
| `/me/booking` | 預約狀態與付款；`?demo=pending\|confirmed` seeds a booking |
| `/coach`, `/coach/lessons`, `/coach/profile`, `/coach/payments` | 教練端：今天、課程與時段、我的教練頁（編輯＋即時預覽，桌機左右並排）、收款 (F5) |
| `/design` | Style guide: brand, logo, foundations, components, and every flow with its PRD mapping |

## Structure

- `src/styles/tokens.css` — design tokens. They are Tailwind theme values too (`bg-accent`, `text-muted`, `border-line`, `rounded-md`, `font-num`, `bg-level-3`).
- `src/styles/pikyoo.css` — design-system classes (`.btn`, `.ticket`, `.seats`, `.level`, `.cred`, `.chip`, `.sheet`, `.tabbar`, `.sticky-cta`…), ported 1:1 from the handoff `styles.css`. Tailwind preflight is intentionally **off** so these render exactly as designed.
- `src/styles/screens.css`, `coach.css`, `design.css` — screen-level styles from the prototypes.
- `src/components/pk/` — `Icon` (pickleball icon set), `PkMark`/`PkBall` (logo), `LevelChip`, `Cred`, `Sprout`, `Status`, `CourtArt`, `GameTicket`, `Seats`, `AppBar`, `Sheet`, `TabBar`, `LevelPicker`, `Toast`.
- `src/features/` — screens (`games/`, `coaches/`, `console/`).
- `src/lib/data/` — mock data; `src/lib/types.ts` follows the PRD §7 data model.
- `src/features/host/parse.ts` — rule-based stand-in for the AI 一貼成局 LLM call; same draft + unsure-fields contract, so the LLM can replace `parseGameText()` without UI changes.
- Coach photos are read from `public/photos/` (list in `../docs/PHOTOS.md`); a missing file renders a placeholder, and bundled demo photos are tagged 「AI 示意照」.
- `src/lib/demo-store.tsx` — in-memory client state (profile, the signed-in coach's editable page `myCoach`, 揪團 `groups`, games I opened, my registrations, filters, compare list, booking, coach requests/payments). It survives client navigation and resets on reload; it is the seam where Supabase queries go.

See `../docs/DESIGN_SYSTEM.md` for the design rules.
