# PIKYOO｜匹友 — 後端與真實資料規劃（BACKEND）

> 版本 v0.1（2026-09-30）。從 mock demo 走到真的有資料、能登入、能報名的版本。
> 相關文件：[PRD.md](PRD.md)（功能規格）、[SETUP.md](SETUP.md)（帳號與金鑰怎麼開）、[BUSINESS_MODEL.md](BUSINESS_MODEL.md)（收費）。
> 資料庫的實際定義在 `supabase/migrations/`，本文件說明「為什麼這樣設計」。兩者不一致時以 migration 為準，並回頭修正本文件。
> **已確認的決定與目前進度見 §13**（換新的 Claude session 時先看這裡）。

---

## 0. 結論

1. **Demo 版保留，而且會跟著正式版一起改。** 做法是「同一份程式碼、兩個網址」：畫面只有一套，資料來源用一個開關切換（`demo` 用現在的假資料，`live` 接 Supabase）。正式版改畫面時，Demo 版自動一起更新，不會有兩份程式碼越差越多的問題（§1）。
2. **資料庫已經設計好並寫成 migration**（`supabase/migrations/`）：17 張表、權限規則（RLS）、報名與候補等交易邏輯（RPC 函式）。在本機 Postgres 上用 seed 資料跑過 50 多項自動檢查，全部通過（§4、§9）。
3. **規則寫在資料庫裡，不寫在畫面裡。** 例如「最後一個名額兩個人同時按」「候補自動遞補」「揪團滿人數才能送出」「問與答不能留 LINE」都由資料庫函式保證。之後做原生 App 也能直接共用（PRD §9）。
4. **接下來分 8 個階段做（B1–B8）**，每個階段都能上線、都不會弄壞 Demo。第一步 B1 需要你先開 Supabase 專案（SETUP §2），我拿到 project ref 後就能開始（§10、§11）。

---

## 1. Demo 版怎麼保留

### 1.1 做法：一份程式碼、一個開關、兩個網址

| | Demo 版 | 正式版 |
|---|---|---|
| 網址（建議） | `pikyoo-demo.vercel.app`（新開的 Vercel 專案，同一個 repo） | `pikyoo.vercel.app` |
| 開關 `NEXT_PUBLIC_DATA_SOURCE` | `demo` | `live`（接好之前維持 `demo`） |
| 資料 | 現在的假資料（`packages/core/src/data/`），存在瀏覽器記憶體，重新整理就還原 | Supabase 資料庫 |
| 登入 | 假登入（「我的」裡的登出／登入切換） | LINE 登入（LIFF） |
| 用途 | 簡報、招商、教練說明會、給投資人看 | 真的使用者 |

- 開關**沒設定時一律當成 `demo`**，避免不小心讓 Demo 網址連到真的資料庫。
- `main` 合併後兩個網址都會自動重新部署，所以**畫面永遠一致**。
- 今天的 Demo 狀態就是 `main` 上的 commit `e50ad97`。如果想固定一個「2026-09-30 版」快照，可以另外打 git tag。

### 1.2 為什麼不另外開一個 demo 分支

分支凍結後，正式版每改一次畫面，Demo 版就要手動再改一次，幾週後兩邊就對不起來了。這正是你擔心的「正式版改了，Demo 版也要跟著改」。用開關的話，**畫面元件只有一份，只有「資料從哪裡來」有兩份**。

### 1.3 維護規則（寫進 `CLAUDE.md`，之後每次改動都照做）

1. 新功能先定好資料的 TypeScript 型別，**Demo（mock）和正式（Supabase）兩個實作都要補**。型別不齊時 `npm run build` 會失敗，不會漏掉。
2. Mock 資料要能展示新功能（例如新增「收藏」，mock 就要有幾筆收藏）。
3. `supabase/seed.sql` 由 mock 資料自動產生（`npm run db:seed`），所以開發用的資料庫和 Demo 看起來一樣。
4. 每個 PR 都要檢查兩種模式的畫面（§9）。

---

## 2. 整體架構

```text
手機瀏覽器 ／ LINE 內（LIFF）／ 電腦
        │
Next.js（Vercel，東京 hnd1）
  ├─ 頁面：Server Components 讀資料 → 資料來源（demo：mock ／ live：Supabase，用登入者的身分，受 RLS 限制）
  ├─ 動作：Server Actions → 呼叫資料庫函式（報名、預約、確認、回覆…）
  ├─ /api/auth/line      LIFF ID token → 驗證 → 換成 Supabase 登入（SETUP §4.2）
  ├─ /api/notify         讀通知佇列 → LINE 推播／Email（排程呼叫）
  └─ /api/parse-game     AI 一貼成局（LLM 結構化輸出）
        │
Supabase（東京 ap-northeast-1）
  ├─ Postgres：資料表 + RLS（誰能看、誰能改）+ RPC 函式（有規則的動作）
  ├─ Auth：登入 session（LINE 身分由我們自己的 route 換發）
  ├─ Storage：教練照片、球場照片（公開）、證書掃描（私密）
  └─ pg_cron：每幾分鐘處理過期預約、揪團逾時、上課提醒
```

**原則：**
- **讀**：頁面在伺服器端直接讀資料庫，教練頁、球場頁、球局頁都是 SSR，對 SEO 和 LINE／IG 分享預覽友善（PRD F10）。
- **寫**：一般欄位（改自己的檔案、教練改自己的頁面）直接寫表，由 RLS 把關；**牽涉名額、狀態、別人的資料**的動作一律走資料庫函式。
- **秘密金鑰只在伺服器**：瀏覽器只拿 publishable key，權限完全靠 RLS。`SUPABASE_SECRET_KEY` 只在 `/api/auth/line`、通知佇列、管理工具用。

---

## 3. 前端資料層：怎麼從 mock 換成真的

現在畫面直接 import `@pikyoo/core/data/*` 的假資料，並透過 `lib/demo-store.tsx`（`useDemo()`）改狀態。改法：

```text
packages/core/src/source/      （網站與未來 App 共用，不含 Next.js 程式）
  types.ts        Catalog（球場、教練、球局、日期標題）與 DataSource 介面
  demo.ts         直接回傳 @pikyoo/core/data/*（行為和今天完全一樣）
  live.ts         createLive({ url, publishableKey })：Supabase 查詢 + mapper，資料庫欄位 → 畫面用的型別
  db.types.ts     `supabase gen types typescript` 產生的資料庫型別
web/src/lib/source.ts          依 NEXT_PUBLIC_DATA_SOURCE 選 demo 或 live；getCatalog / getCourt / getCoach / getGame；live 每次請求重新讀（connection()）
web/next.config.ts             live 模式缺 Supabase 變數或網址格式不對時，**建置直接失敗**（Vercel 會繼續用上一版）
```

- **B1 的做法**：root layout 在伺服器端讀一次 `getCatalog()`，交給 `DemoProvider`；畫面用 `useCatalog()`、`useCoaches()`、`useAllGames()` 拿資料，不再直接 import mock。詳細頁（`/coaches/[id]` 等）在伺服器端用 `getCoach()` 這類函式。live 模式每次請求都重新讀，所以詳細頁拿掉了 `generateStaticParams`；demo 模式的詳細頁因此也改成每次請求產生，畫面不變。
- **B1 還沒做的**：寫入動作（`actions.ts`：報名、預約、回覆…）在 B2 之後跟登入一起做，現在兩種模式都還是寫在瀏覽器記憶體；`proxy.ts`（刷新登入 session）也移到 B2。預約的日期（`BOOKING_DAYS`）和問與答仍用 mock，B5 換掉。
- **B1 live 模式的限制**：球局列表只顯示「今天、明天、這個週末」（跟 demo 一樣的四組），其他平日的球局 B3 做伺服器端篩選時再加；教練的評價、球場距離與地圖座標還沒有資料，先不顯示。

- **畫面用的型別（`@pikyoo/core/types`）先不改。** mapper 把 `starts_at`（UTC）轉成畫面要的「今天／週六」「10/3」「19:00」，教練的 `students`、`priceFrom` 從資料庫算出來。這樣第一輪幾乎不用動畫面元件。
- `signedIn`：demo 看切換開關；live 看伺服器端讀到的 Supabase session。
- 篩選、比較、畫面暫存（`gameFilters`、`compare`、`booking` 草稿）仍然是前端狀態，兩種模式共用。

---

## 4. 資料庫設計

定義：`supabase/migrations/20261001000000_init.sql`（表、RLS、函式）與 `…_storage.sql`（照片與證書）。

### 4.1 資料表

| 表 | 內容 | 誰能看 | 誰能改 |
|---|---|---|---|
| `profiles` | 暱稱、頭像、程度（0 新手 … 6 4.5+） | 所有人（只有公開欄位） | 本人（暱稱、頭像、程度） |
| `profile_private` | LINE user ID、常打區域、通知設定、是否管理員 | 本人 | 本人（區域、通知）；LINE ID 與管理員只有伺服器能寫 |
| `courts` | 球場：區域、室內／室外／風雨、場地數、收費、設施、預約方式、照片、已確認日期 | 所有人 | 營運團隊（管理員） |
| `games` | 球局：時間、場地、程度、名額、費用、取消期限、新手友善、團主聯絡方式、AI 原文 | 所有人 | 團主（自己的局；名額相關走函式） |
| `game_participants` | 報名紀錄：已報名／候補／取消／晚取消／出席／未到；也可以是團主代報名的非會員 | 所有人（名單） | 只能透過函式 |
| `coaches` | 教練頁：網址、名稱、狀態（草稿→審核中→已上架）、自介、匹克球檔案、每週時段、上課地點、付款方式、照片、經歷 | 已上架的所有人都看得到；本人看得到自己的草稿 | 本人（狀態只有管理員能改） |
| `coach_pay_details` | 收款資訊（LINE Pay 連結、銀行帳號） | 本人；學生只有在教練確認、要付款時才看得到自己那筆的 | 本人 |
| `credentials` | 認證與成績：發證單位、等級、證書檔案、審核狀態 | 已審核通過或自填（DUPR）的公開 | 本人上傳；**審核只有管理員** |
| `coach_plans` | 方案：體驗課／一對一／小班／團體、時長、人數、可揪朋友的人數範圍、價格、單位 | 所有人 | 本人 |
| `lesson_bookings` | 預約申請：待確認→已確認／婉拒／逾時→取消／出席／未到 | 學生本人、該教練、揪團成員 | 只能透過函式 |
| `lesson_groups` + `lesson_group_members` | 揪朋友一起上：發起人、邀請碼、截止時間、成員 | 成員與該教練（邀請頁用邀請碼查） | 只能透過函式 |
| `payments` | 每人一筆應付款：待付→已回報（含轉帳末五碼）→已收款 | 付款人與該教練 | 只能透過函式 |
| `questions` | 問與答 | 已回覆的公開；未回覆的只有發問者與教練 | 發問者新增；教練透過函式回覆、隱藏 |
| `favorites`、`reports` | 收藏、資料錯誤／檢舉回報 | 本人（回報也給管理員） | 本人 |
| `notifications` | 通知佇列（LINE／Email／站內） | 本人 | 只有資料庫函式會新增 |

**跟 PRD §7 初稿不同的地方**（本文件取代 §7 的細節）：
- `classes` + `class_sessions` 改成 `coach_plans` + 教練的「每週時段」（`coaches.availability`）。這跟現在畫面的設計一致：教練設定方案和每週開放時間，學生挑日期時段。某個時段第一個被預約的方案就是那堂課的方案，其他方案就不能再約那個時段（教練同一時間只能教一堂）。
- 新增 `lesson_groups`（揪朋友一起上，F3-10）、`payments`（收款，F5）、`questions`（問與答，F3-11）、`coach_pay_details`。
- LINE user ID 從 `profiles` 移到 `profile_private`：名單會公開顯示暱稱，但 LINE ID 不能被別人讀到（PRD §8 隱私）。
- 教練的 `contact_line` 欄位**拿掉**：學生與教練不私下用 LINE 聯絡（CLAUDE.md 產品決定）。球局團主可以留聯絡方式（`games.host_contact`）。
- 球局狀態不存成欄位：「招募中／額滿／進行中／已結束」由人數和時間算出來，只有「已取消」會記下來。這樣不需要排程去改狀態，也不會有狀態跟實際人數對不上的問題。

### 4.2 有規則的動作（資料庫函式）

| 函式 | 做什麼 | 規則 |
|---|---|---|
| `join_game` | 報名球局 | 有空位就報名，額滿就候補；已開始或已取消不能報；團主設「嚴格程度」時擋程度不符的人 |
| `leave_game` | 取消報名 | 取消期限前是一般取消，之後記「晚取消」；空出來的位子自動給候補第一位並通知 |
| `host_add_guest`、`host_remove_participant`、`cancel_game` | 團主代報名、移除、取消整團 | 只有團主；取消會通知所有報名者 |
| 改名額（直接改 `games`） | 團主加名額 | 名額變多時自動遞補候補；不能少於已報名人數 |
| `request_booking` | 送出預約申請 | 只能約教練有開的時段；名額要夠；付款方式要是教練收的；48 小時或開課前沒回覆就逾時 |
| `decide_booking` | 教練確認／婉拒 | 確認後每個人各開一筆應付款（揪團時每人付自己那份）並通知 |
| `create_lesson_group` → `join_lesson_group` → `submit_lesson_group` | 揪朋友一起上 | 先佔時段、拿邀請碼：揪團期間保留「成員數」與「方案最少人數」取大者的名額，超過的名額仍可單獨預約；朋友用連結加入；滿最少人數才能送給教練；開課前 24 小時還沒送出就逾時取消 |
| `report_payment`、`mark_payment_paid`、`payment_instructions` | 付款 | 學生回報（可附末五碼）；教練標記已收；學生只看得到自己那筆的收款資訊 |
| `answer_question`、`hide_question` | 教練回覆、隱藏提問 | 問題和回覆都不能有電話、Email、LINE／IG 帳號、「私訊我」（跟 `packages/core/src/contact.ts` 同一套規則，兩邊要一起改） |
| `expire_stale` | 排程：過期預約、逾時揪團 | 每幾分鐘跑一次（pg_cron，B5 設定） |
| `delete_my_account` | 刪除帳號（F1-5） | 個資清掉、名稱改成「已刪除使用者」，歷史紀錄保留；未來的報名自動取消 |

同一個時段的預約會先排隊鎖住，兩個人同時搶最後一個名額，只會有一個人成功。

### 4.3 防呆

- 教練不能自己把狀態改成「已上架」，也不能自己把證書改成「已審核」（資料庫 trigger 擋掉）。
- 所有表預設**沒有權限**，只開放明確列出的欄位與動作。少寫一條規則的結果是「看不到」，不是「被看光」。
- 時間一律存 UTC，顯示用台北時間；「週六 14:00」這種每週時段用台北時間判斷。

### 4.4 照片與檔案（Supabase Storage）

| Bucket | 公開 | 內容 | 規則 |
|---|---|---|---|
| `coach-photos` | ✅ | 教練頁照片（≤ 5 MB，jpg／png／webp） | 只能上傳到自己的資料夾 `<user id>/…` |
| `court-photos` | ✅ | 球場照片 | 管理員 |
| `credentials` | ❌ | 證書掃描（≤ 10 MB，含 pdf） | 本人上傳、本人與管理員可看 |

Demo 的示意照仍放在 `web/public/photos/`（PHOTOS.md），真的教練上傳自己的照片後就不再用示意照。

---

## 5. 登入

照 SETUP §4.2 的「LIFF ID token 換 Supabase session」：

1. LINE 內打開：`liff.init()` 自動登入；外部瀏覽器按「用 LINE 登入」→ `liff.login()`。
2. 前端拿 `liff.getIDToken()` POST 到 `/api/auth/line`。
3. 伺服器向 LINE 驗證 token → 用 LINE user ID 找或建 Supabase 使用者（新使用者自動建 `profiles`，帶入 LINE 暱稱和頭像）→ 寫入登入 cookie。
4. 第一次登入進 Onboarding（暱稱 → 程度 → 常打區域），寫進 `profiles` / `profile_private`。
5. 現在畫面上所有「登入後才能用」的地方（`LoginSheet`）改成真的 LINE 登入，登入後回到原本那頁。

Email magic link（F1-2，P1）之後加，給不用 LINE 的人。

**實作（B2 第一部分，2026-10-04）**
- **開關**：live 模式**且**設了 `NEXT_PUBLIC_LIFF_ID` 才啟用真登入（`web/src/lib/env.ts` 的 `realAuth`）；沒設就維持 demo 的登入切換。所以在 LINE channel 建好之前，正式站的行為不變。`next.config.ts` 會檢查：設了 LIFF ID 就必須有 `LINE_CHANNEL_ID`、`SUPABASE_SECRET_KEY`。
- **程式**：`lib/supabase.ts`（伺服器端 client、`getMe()`）、`src/proxy.ts`（刷新 session cookie）、`app/api/auth/line/route.ts`、`lib/account.ts`（登出、存設定、刪除帳號的 Server Actions）、`lib/line.ts`（LIFF，按下登入才載入）、`lib/use-account.ts`（畫面統一呼叫，demo／真登入自動切換）、`components/pk/LineAutoLogin.tsx`（LINE 內自動登入）。讀寫自己的資料在 `@pikyoo/core/source/me`，App 共用。
- **換發 session**：LINE 帳號沒有 Email，伺服器幫它建一個 `<LINE id>-<時間>@line.pikyoo.invalid`（`.invalid` 保證收不到信），用 Admin API `generateLink` 拿一次性 token，再在伺服器端 `verifyOtp` 寫入 cookie。**不經過 Supabase 的重新導向網址**，所以 LINE 登入不需要 Auth URL 設定（Email 登入才需要）。
- **資安**：`handle_new_user` 改從 `raw_app_meta_data`（只有伺服器能寫）讀 LINE ID（`20261003181440_line_id_from_app_metadata`）。原本讀 `raw_user_meta_data`，使用者自己可以填，有人能用 Email 註冊時填別人的 LINE ID，讓對方登入時進到他的帳號。
- **刪除帳號**：`delete_my_account()` 匿名化 → 全裝置登出 → Admin API 封鎖這個 auth 使用者。同一個 LINE 之後再登入會是新帳號。
- **還沒驗證的**：真的 LINE 登入（要 LIFF ID）。若 Supabase 拒絕 `.invalid` 結尾的 Email，改 `route.ts` 的 `lineEmail` 一行即可。

---

## 6. 通知

- 資料庫函式只負責**把通知放進佇列**（`notifications`），不直接打 LINE API。這樣報名不會因為 LINE 慢或掛掉而失敗，也能重試（PRD §8 可靠性）。
- 排程每分鐘處理佇列：pg_cron + pg_net 呼叫 `/api/notify`（或 Supabase Edge Function），依 PRD F6 的表決定走 LINE、Email 或站內。Vercel Hobby 的 cron 只能每天跑一次（以 Vercel 官方說明為準），所以排程放在 Supabase。
- LINE 推播按收件人數計費：只有 PRD F6 標 **LINE** 的事件推 LINE，其他走站內與 Email（Resend）。
- 上課／打球前提醒（前一天 20:00 或 3 小時前）也由 pg_cron 產生佇列。

---

## 7. AI 一貼成局

- 新增 `/api/parse-game`：把貼上的文字送給 LLM，要求回傳固定格式的 JSON（PRD F2-8 的欄位 + 每個欄位的信心分數），伺服器端再比對球場資料庫。
- 現在的規則式解析器（`web/src/features/host/parse.ts`）保留：Demo 模式用它，正式版在 LLM 失敗或逾時的時候也退回它。兩者輸出格式一樣，畫面不用改。
- 原文存在 `games.source_text`，用來累積測試集（PRD：50 則真實揪團文、欄位正確率 ≥ 80% 才上線）。

---

## 8. 金流（MVP 不經手錢）

- 跟現在 Demo 一樣：教練確認後，學生看到教練的 LINE Pay 連結或帳號（`payment_instructions`），付完按「我已付款」（轉帳附末五碼），教練在後台按「已收款」。
- 取消費（例如 24 小時內取消收 50%）MVP 先由教練手動處理，系統只記錄取消時間。
- Phase 3 接藍新平台金流（不過水、代扣平台費，BUSINESS_MODEL.md）時，`payments` 表加上交易編號與平台費欄位即可，不用改預約流程。

---

## 9. 環境與檢查

### 9.1 環境

| | 本機 | 分支預覽（Preview） | 正式（`pikyoo`） | Demo（`pikyoo-demo`） |
|---|---|---|---|---|
| `NEXT_PUBLIC_DATA_SOURCE` | `demo` 或 `live` | `live` | `live`（B1 完成後切換） | 不設定（＝ `demo`） |
| Supabase | `pikyoo-dev` | `pikyoo-dev` | `pikyoo-dev`（封測前升級 Pro；有真人使用前再另開測試用專案） | 不需要 |
| LINE | Developing LIFF ID | Developing LIFF ID | Published LIFF ID | 不需要 |

### 9.2 資料庫改動流程

1. `supabase migration new <名稱>` 產生新的 SQL 檔，**只改 migration 檔，不在 Supabase 網頁後台直接改表**。
2. `cd web && npm run db:check`：在一個暫時的本機 Postgres 資料庫套用所有 migration + seed，跑 `supabase/dev/checks.sql` 的權限與流程檢查（不需要 Docker；需要本機有 Postgres 15 以上）。
3. mock 資料改了就 `npm run db:seed` 重新產生 `supabase/seed.sql`。
4. GitHub Actions（`.github/workflows/db.yml`）在每個動到 `supabase/` 或 mock 資料的 PR 自動跑第 2、3 步。
5. 合併後套用到 `pikyoo-dev`：由 Claude 透過 Supabase MCP 執行（§9.4），或用 `supabase db push`。

### 9.3 每個 PR 的畫面檢查

維持 CLAUDE.md 的做法（Playwright 1280 / 390 寬），而且 **demo 和 live 兩種模式都要看**。live 模式接好後，加上端到端流程測試：登入 → 報名 → 候補遞補 → 預約 → 教練確認。

### 9.4 Supabase MCP（讓 Claude 直接操作資料庫）

Supabase 官方的 MCP server：`https://mcp.supabase.com/mcp`，用 Supabase 帳號登入授權（OAuth），不需要貼任何金鑰。

1. 在 <https://claude.ai/customize/connectors> 新增自訂 connector：名稱 `Supabase`，URL 填 `https://mcp.supabase.com/mcp?project_ref=<project ref>`（加上 `project_ref` 就只能碰這一個專案）。
2. 按 Connect → 用 Supabase 帳號登入 → 授權 `PIKYOO` organization。
3. **開一個新的 Claude session**：connector 只在 session 開始時載入。

接上後 Claude 可以：套用 migration、跑 seed、查表、跑 Supabase 的安全檢查（advisors）、產生 TypeScript 型別、取得 Project URL 與 publishable key。
Claude 做不到、要你自己來的：把 **secret key** 貼到 Vercel 環境變數（secret key 不能經過聊天室）、Auth 的網址設定（SETUP §2.4）。
開始有真的使用者之後，正式專案的 MCP 改成唯讀（URL 加 `&read_only=true`），資料庫改動改走 migration + GitHub Actions。

### 9.5 Vercel 免費版（Hobby）的限制

- 沒有綁卡、不會自動收費。用量超過時是**暫停專案**，不是寄帳單（[Hobby 說明](https://vercel.com/docs/plans/hobby)）。
- 每天最多 100 次部署、同時只能 1 個 build。我們平常一天 5–20 次，夠用。
- Vercel 的 cron 在 Hobby 只能每天跑一次，所以排程放在 Supabase（§6）。
- **只能非商業使用**：開始收平台費、接金流或放廣告前要升級 Pro（每人每月 US$20）。
- Demo 專案設定 **Ignored Build Step** = `[ "$VERCEL_ENV" != "production" ]`，只在 `main` 合併時部署，避免每次推分支都部署兩次。

---

## 10. 分階段實作

每個階段一個 PR。Demo 有自己的網址（`pikyoo-demo`），所以正式網址在 B1 完成後就切到真的資料，之後每個階段直接在正式網址上看得到。

| 階段 | 內容 | 需要你先做的事 | 完成標準 |
|---|---|---|---|
| **B0（本次）** | 本文件、資料庫 schema、RLS、函式、Storage、seed 產生器、自動檢查、CI | — | `npm run db:check` 全部通過 |
| **B1 資料層與連線** | §3 的資料來源開關；安裝 `@supabase/ssr`、`proxy.ts`；球場、教練、球局的**讀取**改走資料來源；開 Demo 專用網址 | 開 Supabase `pikyoo-dev`（✅）；接上 Supabase MCP（§9.4）；把 3 個變數填到 Vercel `pikyoo`；在 Vercel 新增 `pikyoo-demo` 專案 | live 模式讀得到 seed 資料；demo 模式畫面跟今天完全一樣 |
| **B2 登入** | LINE 登入、Onboarding、我的、登出、刪除帳號、隱私權政策頁 | LINE MINI App channel（SETUP §3），給我 LIFF ID 與 Channel ID | 手機 LINE 內自動登入；外部瀏覽器 2 步內登入 |
| **B3 球局** | 列表與篩選（伺服器端查詢）、報名／候補／取消、開團、團主管理、分享卡片與動態 OG 圖、AI 一貼成局 | LLM API 金鑰（放 Vercel 環境變數） | 兩支手機同時搶最後一個名額，只有一人成功 |
| **B4 教練頁與後台** | 申請成為教練、編輯頁存檔、照片上傳、證書上傳、管理員審核 | 決定第一批合作教練名單 | 教練自己建好頁面、審核後上架 |
| **B5 預約、揪團、問與答、收款** | 預約申請與確認、揪朋友一起上、問與答、收款回報；pg_cron 處理逾時 | — | 教練後台的「今天」「收款」都是真的資料 |
| **B6 通知** | LINE 官方帳號推播（Flex 卡片）、Email、上課／打球前提醒 | LINE 官方帳號 + Messaging API（SETUP §3.4）；Resend 帳號 | 候補遞補、預約確認在 1 分鐘內收到 LINE |
| **B7 營運後台與 SEO** | 管理員頁（審核、球場資料、下架、回報佇列）、sitemap、結構化資料、Sentry、PostHog | — | 營運不用進 Supabase 後台就能做日常工作 |
| **B8 封測** | **清掉 seed 的示範資料**、雙北約 100 處球場的真實資料、另開測試用 Supabase 專案、MCP 改唯讀 | 升級 Supabase Pro、Vercel Pro（開始收費前） | 10 位團主 + 10 位教練開始使用 |

B1–B3 是最短的「真的能用」路徑：讀得到資料 → 能登入 → 能報名球局。

---

## 11. 需要你決定的事

1. ~~Demo 網址名稱~~、~~正式網址什麼時候切換~~、~~Supabase 專案~~：已決定，見 §13。
2. **LINE MINI App channel**：B2 之前完成即可（SETUP §3）。

---

## 12. 風險與對策

| 風險 | 對策 |
|---|---|
| 權限規則寫錯，資料被不該看的人看到 | 預設全部關閉、只開明列的；`checks.sql` 用不同身分實際測試「看得到／看不到」；每個 PR 自動跑 |
| Supabase Free 一週沒用會暫停 | 開發用專案暫停了按 Restore 就好；正式專案用 Pro |
| Demo 與正式版慢慢不一致 | 畫面只有一份；資料層兩個實作共用同一個型別介面，缺了 build 會失敗；seed 從 mock 產生 |
| LINE 規格或政策變動 | 核心功能不依賴 LINE 專屬 API；登入流程集中在 `/api/auth/line` 一個地方 |
| 球場資料建置很花人力 | 先做有球局、有教練的場地；B7 的管理員頁讓營運直接編輯 |
| 問與答的聯絡方式規則被繞過 | 前端擋一次、資料庫再擋一次；教練可隱藏提問；之後加檢舉 |

---

## 13. 已確認的決定與目前進度

| 日期 | 決定 |
|---|---|
| 2026-09-30 | **正式版** = Vercel 原本的 `pikyoo` 專案（`pikyoo.vercel.app`）+ Supabase `pikyoo-dev`。B1 完成後正式網址就切到 `live`。 |
| 2026-09-30 | **Demo 版** = 另開的 Vercel 專案 `pikyoo-demo`，接同一個 repo、Root Directory `web`、不設環境變數（＝ demo 模式），只在 `main` 合併時部署（§9.5）。 |
| 2026-09-30 | 先只用**一個** Supabase 專案（`pikyoo-dev`），正式與分支預覽共用。有真的使用者之前再另開測試用專案（免費版最多 2 個）；封測前升級 Pro。 |
| 2026-09-30 | seed 的示範教練與球局會先放在正式資料庫，讓頁面不是空的；**公開上線前清掉**（示意照不能當成真教練）。 |
| 2026-09-30 | 資料庫操作由 Claude 透過 Supabase MCP 統一處理（§9.4）。 |
| 2026-09-30 | 本機 Claude Code 也接好 Supabase MCP 與 CLI（`supabase login` + `link`），`supabase db push` 可直接套用 migration。 |
| 2026-09-30 | **揪團湊人時保留「成員數與最少人數取大者」的名額**。只保留已加入的人時，陌生人可能先訂走剩下的位子，揪團就湊不到最少人數；整堂保留又會把教練的時段佔到開課前 24 小時。這樣揪團一定湊得起來，多出來的名額仍開放給其他人。 |
| 2026-10-02 | **B1 的做法**：`web/src/lib/source/`（`index.ts` 開關、`demo.ts`、`live.ts`、`types.ts`、`db.types.ts`）。root layout 每個請求讀一次 catalog（球場、教練、球局、日期標題）交給 `DemoProvider`，畫面用 `useCatalog` / `useCoaches` / `useAllGames`。live 模式要每次請求重新讀（`connection()`），所以詳細頁拿掉 `generateStaticParams`。`@supabase/ssr`、`proxy.ts`、寫入動作移到 B2。程式在分支 `claude/b1-data-source`（[#11](https://github.com/wutiger555/PIKYOO/pull/11)）。 |
| 2026-10-03 | **B1 上線後回滾**：#11 合併並在 Vercel 設 `NEXT_PUBLIC_DATA_SOURCE=live` 後，正式站每頁 500（約 6 分鐘）；Supabase 沒收到任何來自 Vercel 的請求，推測是 Vercel 環境變數沒被正式環境讀到或格式不對。已 revert（[#12](https://github.com/wutiger555/PIKYOO/pull/12)），正式站回到 demo 資料。之後**切 live 前先在 Preview 網址確認 live 模式正常**，再合併。 |

**目前進度**（2026-10-04）

- [x] B0：規劃、schema、RLS、函式、seed、檢查（[#8](https://github.com/wutiger555/PIKYOO/pull/8)）
- [x] Supabase `pikyoo-dev` 已建立；Owner 已接上 Supabase MCP（§9.4）；Vercel `pikyoo-demo` 已開（`https://pikyoo-demo.vercel.app`）
- [x] `pikyoo-dev` 已套用的 migration：`init`、`storage`、`group_holds_minimum`、`20261002083200_pin_search_path`（修 advisor 0011：5 個函式沒設 `search_path`）＋ `seed.sql`
  - ⚠️ `pin_search_path` 的檔案因為 #12 revert 暫時**不在 `main`**，但已經套用在資料庫；B1 重新合併時檔案會回來。在那之前不要跑 `supabase db push`（會看到資料庫多一個本機沒有的版本）
  - 其餘 advisor 警告是預期中的：RPC 本來就給前端呼叫；`is_admin`、`my_coach_id`、`is_group_member` 被 RLS 使用，訪客也要能執行
- [x] seed 的示範球局日期已移到 10/3–4 與 10/10–11（2026-10-03）。seed 日期是套用當天往後算的，**會過期**；過期後用 SQL 把 `md5('pikyoo-seed-game:g1')::uuid` … `g6` 的 `starts_at`/`ends_at` 往後移（g1–g3 今天／明天，g4–g6 下個週末）
- [x] Owner：Vercel `pikyoo` 已填 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`、`SUPABASE_SECRET_KEY`、`NEXT_PUBLIC_DATA_SOURCE=live`（現在的 `main` 不讀它們，留著沒影響）
- [x] **B1 重新上線**（[#17](https://github.com/wutiger555/PIKYOO/pull/17)，2026-10-04）：資料來源移到 `packages/core/src/source/`；`next.config.ts` 在 live 設定有誤時讓建置失敗。
  - **10/3 事故的真正原因**：Vercel 的 `NEXT_PUBLIC_SUPABASE_URL` 少了最後一個字（`…supabase.c`），連不到主機，所以每頁 500、Supabase 也收不到請求。新的保險在建置時就擋下，並在 log 說明哪裡不對（Vercel 會把機密值遮成 `[REDACTED]`，所以訊息只描述格式）。
  - 四個變數現在都勾了 Production 與 Preview；Preview 網址也是 live 模式。
  - Claude 本機已登入 Vercel CLI（owner 的帳號）：可以 `vercel redeploy`、`vercel curl`（讀有保護的 Preview）、`vercel inspect --logs`。`vercel curl` 第一次使用時自動在專案建立了一組 Deployment Protection bypass token。
- [ ] Owner：Auth 網址設定（SETUP §2.4）：LINE 登入用不到（§5），做 Email 登入（F1-2）前完成即可
- [ ] **B2 登入**（目前卡在這）：
  - [x] Claude：程式完成（§5「實作」）；資料庫層用一個會 rollback 的交易在 `pikyoo-dev` 驗證過（建帳號 → 存設定 → 讀回 → 刪除），本機驗證訪客畫面、LIFF 錯誤提示、`/api/auth/line` 拒絕假 token
  - [x] Owner：LINE MINI App channel 已建（Developing `2011850000` / LIFF `2011850000-KYVRZraL`，endpoint = `claude/line-login` 分支的 Preview；Published `2011850002` / LIFF `2011850002-OPHHAngO`，endpoint `https://pikyoo.vercel.app`；Scopes `openid`、`profile`）
  - [x] Claude：Vercel `LINE_CHANNEL_ID`（Preview＝Developing、Production＝Published）；`NEXT_PUBLIC_LIFF_ID` 只設在 Preview 的 `claude/line-login` 分支
  - [x] 2026-10-04 Owner 在 Preview 用真的 LINE 登入測過：建帳號、首次設定、登出、再登入回同一個帳號都正常。測試中修掉三個問題：Supabase Auth 先 insert 再寫 app_metadata，LINE ID 沒存到（`20261004021536_sync_line_user_id`）；首次設定只在最後一步存（改成每步存）；登入後標頭要重新整理才更新（改成整頁重新載入）
  - **決定（2026-10-04）**：正式站**先不啟用**真登入（Production 不設 `NEXT_PUBLIC_LIFF_ID`）。登入後「我的課」、預約、問與答、教練後台仍是示範資料，真實使用者會看到別人的假資料；等 B3 報名球局完成、登入後至少有一個真的功能，再一起啟用
  - [ ] 隱私權政策頁：需要 owner 提供營運者名稱與聯絡 Email
- [ ] **B3 球局**（進行中）：
  - [x] 第一部分：報名／候補／取消（`@pikyoo/core/source/games` 呼叫 `join_game`／`leave_game`；live catalog 帶入看的人，把他自己的報名放在 `mine`、不算進名單；取消前先確認）。Owner 在 Preview 用真帳號報名、取消成功；畫面流程 Claude 在 demo 模式測過
  - [x] 第二部分：開團、團主管理（`hostGame`、`addGuest`、`removeParticipant`、`cancelGame`）。live catalog 帶 `hosting`：團主留在自己的名單上、不算進「我報名的」，名單帶 participant id 給團主移除。資料庫流程（開團→團主自動入座→代報名→額滿進候補→移除後遞補→取消）在 `pikyoo-dev` 用會 rollback 的交易驗證過；畫面流程在 demo 模式測過。順便修掉 server action 的錯誤訊息在正式版會被 Next.js 遮掉的問題（改成回傳錯誤）
  - [x] 團主編輯球局資訊（F2-10，[#22](https://github.com/wutiger555/PIKYOO/pull/22)）：`/games/[id]/edit` 沿用開團表單（`HostScreen editing`），`editGame` 直接 update `games`（RLS 只讓團主改）。migration `20261004090000_game_edits`：已取消的局不能改、開始時間不能改到過去；時間、地點、費用有變時通知已報名與候補的人（`game_changed`，payload 帶 `changed`）。「我也要打」開團後不能改（`host_counts` 沒開放 update）
  - [ ] 第三部分：列表伺服器端篩選（不只今天／明天／週末）、分享卡片與動態 OG 圖
  - [ ] 第四部分：AI 一貼成局（需要 LLM API 金鑰）
