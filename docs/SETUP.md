# PIKYOO｜匹友 — 帳號與雲端服務設定指南（SETUP）

> 給第一次碰 Vercel / Supabase / LINE Developers console 的你。照順序做，每一步都很短。
> 最後查證日期：**2026-09-29**。價格與介面會變，每節都附官方文件連結，以官方為準。
> 標示 **〔未驗證〕** 的地方代表查不到官方明確說明，請在 console 上實際確認。

---

## 0. 總覽

### 0.1 要開的帳號

| # | 服務 | 用途 | 耗時 | MVP 月費 |
|---|---|---|---|---|
| 1 | **Vercel** | 部署 `web/`，拿到 HTTPS 網址；每個 PR 一個 Preview | 10 分 | Hobby US$0；**商用需 Pro US$20/人/月** |
| 2 | **Supabase** | Postgres、Auth、RLS、Storage、Edge Functions | 15 分 | Free US$0；Pro US$25/月 |
| 3 | **LINE Developers**（Provider + MINI App channel） | 在 LINE 內開啟、LINE 登入、分享到群組 | 30 分 | 免費 |
| 4 | **LINE 官方帳號**「PIKYOO 匹友」+ Messaging API | 圖文選單、通知推播 | 20 分 | 輕用量 NT$0（200 則/月） |
| 5 | 之後再開：Resend、Sentry、PostHog、網域 | Email、錯誤監控、分析 | — | 多數有免費額度 |

### 0.2 建議順序與原因

1. **Vercel** → 先有一個固定的 `https://…vercel.app` 網址。LIFF 的 Endpoint URL 和 Supabase 的 Site URL 都要填它。
2. **Supabase** → 資料庫與 Auth 先就位，之後 LINE 登入要換成 Supabase session。
3. **LINE Developers：Provider → LINE MINI App channel（內含 LIFF）** → 需要第 1 步的 HTTPS 網址。
4. **LINE 官方帳號 → 啟用 Messaging API** → 啟用時要選 Provider，而且**選了就不能改**，所以 Provider 要先建好。

### 0.3 免費方案的限制（跟你有關的）

- **Vercel Hobby**：只限「非商業、個人使用」。收款、廣告、賣服務、有人拿錢寫這個網站都算商用。
  → 封測、不收錢時用 Hobby；**開始收平台費或接金流前升級 Pro**。〔[Fair use: Commercial usage](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage)、[Hobby](https://vercel.com/docs/plans/hobby)〕
- **Supabase Free**：最多 2 個專案；**一週沒有活動會被暫停**（可在 dashboard 恢復）；DB 500 MB、50,000 MAU、Storage 1 GB、Egress 5 GB。
  Pro US$25/月不會暫停，含每日備份（PRD §8 要求每日備份）。〔[Pricing](https://supabase.com/pricing)、[Billing](https://supabase.com/docs/guides/platform/billing-on-supabase)〕
- **LINE**：LINE Login、LIFF / MINI App 免費。官方帳號 **2026/11/01 起**：輕用量 NT$0（200 則，不可加購）、中用量 NT$1,000（3,000 則）、高用量 NT$1,400（6,000 則，加購 NT$0.2/則，第 50,001 則起 NT$0.15）。
  主動推播按「收件人數」計算。Reply API、加好友歡迎訊息、自動回應不計則數。〔[LINE Biz-Solutions 2026 方案調整](https://tw.linebiz.com/column/LINEOA-2026-Price-Plan/)〕

**MVP 月費估計**：封測 US$0 + NT$0。公開上線、開始收費後約 US$45/月（Vercel Pro + Supabase Pro）+ LINE NT$0–1,000。

### 0.4 為什麼 LIFF 需要 HTTPS？本機怎麼測？

- LIFF / MINI App 的 **Endpoint URL 必須是 `https://`**，不能帶 `#fragment`。使用者在 LINE 內開 `https://miniapp.line.me/{liffId}`，LINE 會把他轉到你的 Endpoint URL。`http://localhost` 不行。〔[Adding a LIFF app](https://developers.line.biz/en/docs/liff/registering-liff-apps/)〕
- 本機測試有兩種方法：
  1. **Vercel Preview（推薦）**：push 到分支，用該分支的固定網址 `pikyoo-git-<branch>-<scope>.vercel.app` 當 Endpoint URL。之後再 push，網址不會變。〔[Generated URLs](https://vercel.com/docs/deployments/generated-urls)〕
  2. **Tunnel**：`cloudflared tunnel --url http://localhost:3000`（每次網址都不同，要回 console 改 Endpoint URL），或用 ngrok 的固定網域〔ngrok 免費方案是否附固定網域：**未驗證**〕。
- 純 UI 開發不需要 LINE，照常 `npm run dev` 在 `http://localhost:3000` 做就好。

---

## 1. Vercel

官方文件：[Configure a build / Root Directory](https://vercel.com/docs/builds/configure-a-build) · [Environment variables](https://vercel.com/docs/environment-variables) · [Function regions](https://vercel.com/docs/functions/configuring-functions/region) · [Deployment Protection](https://vercel.com/docs/deployment-protection)

1. 到 <https://vercel.com/signup> → **Continue with GitHub** → 選 **Hobby**。
2. Dashboard → **Add New…** → **Project** → **Import Git Repository**。
3. 第一次會要求安裝 Vercel GitHub App：選 **Only select repositories** → `wutiger555/PIKYOO`。
4. **Configure Project** 畫面：
   - **Project Name**：`pikyoo`
   - **Root Directory**：按 **Edit** → 選 `web` ← **最重要，漏了會 build 失敗**
   - **Framework Preset**：選完 Root Directory 後應自動變成 **Next.js**，沒變就手動選
   - Build / Output / Install Command：保持預設
   - **Environment Variables**：現在先不用填（app 目前只用 mock data）
5. 按 **Deploy**。完成後記下 Production 網址。本專案已完成這一步：**<https://pikyoo.vercel.app>**（2026-09-30 確認，`main` 合併後自動更新）。
6. **Function 區域改東京**（預設是美東 `iad1`，離台灣和 Supabase 都很遠）：
   Project → **Settings** → **Functions** → **Function Regions** → 選 **Tokyo (hnd1)** → Save。Hobby 只能選一個區域。
7. **Preview 部署**：之後每個 PR / 分支都會自動部署，PR 裡會出現 **Visit Preview** 連結。
8. **Deployment Protection**：Project → **Settings** → **Deployment Protection**。如果 Preview 開了 **Vercel Authentication**，在 LINE 裡打開 Preview 網址會被要求登入 Vercel。要在 LINE 裡測 Preview，就把 Preview 的保護關掉（repo 本來就是 public）。〔新專案是否預設開啟：**未驗證**，請實際看一下這個頁面〕

**環境變數怎麼分（之後接 Supabase / LINE 時）**：Project → **Settings** → **Environment Variables** → 每個變數都可以勾 **Production** / **Preview** / **Development**。
- `NEXT_PUBLIC_*` 會在 **build 時**寫進前端程式碼，改了要 **Redeploy** 才生效。
- 環境變數改完只套用到**新的**部署。
- 用 `vercel env pull` 可以把 Development 的變數拉到本機。

---

## 2. Supabase

官方文件：[Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) · [Server-side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) · [API keys](https://supabase.com/docs/guides/api/api-keys) · [Regions](https://supabase.com/docs/guides/platform/regions) · [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

### 2.1 建立 Organization 與 Project

1. <https://supabase.com/dashboard> → 用 GitHub 登入。
2. **New organization**：名稱 `PIKYOO`，方案 **Free**。
3. **New project**：
   - **Name**：`pikyoo-dev`（先開一個給本機 + Preview 用；正式上線前再開 `pikyoo-prod`，建議用 Pro）
   - **Database Password**：按 Generate，**存進密碼管理器**。之後 CLI `link` / `db push` 會用到。
   - **Region**：選 **Northeast Asia (Tokyo)**（`ap-northeast-1`）。清單裡**沒有台北、香港**；東京離台灣最近，備選是 Singapore（`ap-southeast-1`）。區域建立後不能改。
4. 等 1–2 分鐘專案建好。

### 2.2 網址與金鑰在哪裡

- **Project URL**：`https://<project-ref>.supabase.co`。`<project-ref>` 就是 dashboard 網址 `/project/` 後面那串。
- 最快找法：專案頁上方 **Connect** 按鈕 → 裡面有 Project URL 和 publishable key。
- 完整清單：**Project Settings** → **API Keys**。

| 金鑰 | 格式 | 可以公開嗎 | 放哪裡 |
|---|---|---|---|
| **Publishable key** | `sb_publishable_…` | ✅ 可以（設計上就會出現在瀏覽器，權限靠 RLS） | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| **Secret key** | `sb_secret_…` | ❌ **絕對不行**，會繞過 RLS、有完整權限 | `SUPABASE_SECRET_KEY`（只給伺服器用） |
| Legacy `anon` / `service_role` | JWT | 舊版 | **不要用**；Supabase 預計 2026 年底前淘汰 |

### 2.3 `web/.env.local`

`web/.gitignore` 已經有 `.env*`，所以 `.env.local` 不會進 git（附帶一提：`.env.example` 也會被忽略，之後要加範例檔得先在 `.gitignore` 加 `!.env.example`）。

在 `web/` 建立 `.env.local`，**自己**貼上值：

```bash
# web/.env.local — 不要 commit、不要貼到聊天室
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxx      # 只在伺服器用；名稱絕不能加 NEXT_PUBLIC_
```

- 前兩個變數名稱就是 Supabase 官方 Next.js 指南（`@supabase/ssr`）用的名稱。
- 同樣三個變數也要加到 Vercel → Settings → Environment Variables。`SUPABASE_SECRET_KEY` 建議標成 Sensitive。
- 補充：Next.js 16 的 session 刷新檔案叫 `proxy.ts`（以前叫 `middleware.ts`）。這部分 Claude 實作時會處理。

### 2.4 Auth 網址設定（Email magic link 會用到）

**Authentication** → **URL Configuration**：
- **Site URL**：Vercel Production 網址（之後有自己的網域就改成網域）
- **Redirect URLs** 加入：
  - `http://localhost:3000/**`
  - `https://*-<你的 Vercel scope slug>.vercel.app/**`（所有 Preview）
  - `https://pikyoo.vercel.app/**`（或你的正式網址）

**Authentication** → **Sign In / Providers**：**Email** 保持開啟。LINE 不在這裡設（原因見 §4）。

### 2.5 （選用）Supabase CLI + Docker：本機資料庫與 migrations

需要先裝 Docker Desktop（或 OrbStack 之類的容器工具）。〔[CLI getting started](https://supabase.com/docs/guides/local-development/cli/getting-started)、[CLI reference](https://supabase.com/docs/reference/cli/introduction)〕

```bash
brew install supabase/tap/supabase
cd web            # 或 repo 根目錄，依 Claude 之後的專案結構決定
supabase init     # 產生 supabase/ 資料夾（config.toml、migrations/）
supabase start    # 用 Docker 起本機 Postgres/Auth/Studio
supabase login
supabase link --project-ref <project-ref>   # 會問 Database Password
supabase migration new init_schema          # 產生新的 SQL migration 檔
supabase db push                            # 把 migrations 套用到雲端專案
```

工作流程：**schema 一律寫成 migration 檔、進 git**，不要在雲端 dashboard 直接改表。

---

## 3. LINE

### 3.0 先說結論：LIFF 要建在哪種 channel？

**建議：現在就建「LINE MINI App channel」（區域選 Taiwan），不要在 LINE Login channel 底下新建 LIFF app。** 理由：
- LINE 官方在 LIFF 文件上明寫：LIFF 將併入 LINE MINI App，「建議把新的 LIFF app 建成 LINE MINI App」。〔[Adding a LIFF app](https://developers.line.biz/en/docs/liff/registering-liff-apps/)、[2025/02/12 公告](https://developers.line.biz/en/news/2025/02/12/line-mini-app/)〕
- **2026/03/11 起**，台灣的服務可以直接發佈**未認證 MINI App**；只有認證 provider 才能申請認證審查。〔[2026 News](https://developers.line.biz/en/news/2026/)〕
- **2025/10 起**，MINI App 也能在外部瀏覽器開，用 `liff.login()` 做 LINE 登入。所以同一個 channel 就能涵蓋「LINE 內」和「瀏覽器用 LINE 登入」。〔[External browser](https://developers.line.biz/en/docs/line-mini-app/develop/external-browser/)〕
- MINI App 本質就是 LIFF：同一套 LIFF SDK，`shareTargetPicker`、`getIDToken` 都能用。〔[Specifications](https://developers.line.biz/en/docs/line-mini-app/discover/specifications/)〕

⚠️ 要注意的地方：[LINE MINI App Policy](https://terms2.line.me/LINE_MINI_App?lang=en) 的「Permitted Customers」段落還寫著台灣／泰國要先取得 LY 公司核准。這跟 2026/03/11 的公告互相矛盾，可能是政策頁沒更新。如果建立 MINI App channel 時被擋，改走 §3.3 的備案。

### 3.1 登入 LINE Developers Console、建立 Provider

1. 到 <https://developers.line.biz/console/> → 用 **LINE 帳號**登入（第一次會要求註冊成 developer）。
   官方說：建不了 MINI App channel 時，要把 Business ID 連結到 LINE 帳號。直接用 LINE 帳號登入就能避開這個問題。〔[Login account](https://developers.line.biz/en/docs/line-developers-console/login-account/)〕
2. **Create a new provider** → 名稱 `PIKYOO`。
3. ⚠️ **所有 PIKYOO 的 channel 都放在這個 Provider 底下。** LINE 的 user ID 是「每個 Provider 各一組」，channel 建好後也**不能搬到別的 Provider**。放錯的話，同一個人會變成兩個 user ID。〔[Getting started (MINI App)](https://developers.line.biz/en/docs/line-mini-app/develop/develop-overview/)〕

### 3.2 建立 LINE MINI App channel

官方文件：[Getting started](https://developers.line.biz/en/docs/line-mini-app/develop/develop-overview/) · [Console guide](https://developers.line.biz/en/docs/line-mini-app/discover/console-guide/) · [Console settings shown to users](https://developers.line.biz/en/docs/line-mini-app/develop/configure-console/)

1. Provider `PIKYOO` → **Channels** → **Create a new channel** → **LINE MINI App**。
2. 填寫：
   - **Region to provide the service**：`Taiwan`
   - **Channel name**：`PIKYOO`（要用英文；不能含 "LINE"；中文名「匹友」之後在 Localization 設定）
   - **Channel description**：用英文清楚寫服務內容（例：Find pickleball games, coaches and courts in Taipei.）
   - **Email address**：你的聯絡信箱
   - **Channel icon**：可以之後再上傳
   - 勾選三份同意書，以及「service company's country or region 與服務區域相同」
3. **Create** → 閱讀並 **Accept**「Regarding Consent to Usage of the Information」。建好後就是可用的**未認證 MINI App**。
4. **Basic settings** 分頁：**Privacy policy URL**（非認證 provider 只能在建好後才填）。發佈前要準備好 `/privacy` 頁面。
5. **Web app settings** 分頁。一個 MINI App channel 內建三個「internal channel」，**各有自己的 LIFF ID 和 Endpoint URL**：

   | Internal channel | 誰能開 | Endpoint URL 建議 |
   |---|---|---|
   | **Developing** | 只有你加入的 admin / tester | Preview 分支網址或 tunnel |
   | **Review** | LY 審查員（未認證用不到） | 可先不填 |
   | **Published** | 所有使用者 | Vercel Production 網址（根目錄，例如 `https://pikyoo.vercel.app`） |

   - Endpoint 建議設成**網站根目錄**。原因：`liff.login({ redirectUri })` 的 redirectUri 必須以 Endpoint URL 開頭，否則會登入失敗。〔[LIFF API reference](https://developers.line.biz/en/reference/liff/)〕
   - **Scopes**：勾 `openid`（取 ID token 必需）、`profile`。`email` 先不勾。
   - **shareTargetPicker**：要開啟並同意「Agreement Regarding Use of Information」。〔官方只寫了在 LINE Login channel 的 **LIFF** 分頁怎麼開（[Share target picker](https://developers.line.biz/en/docs/liff/developing-liff-apps/#share-target-picker)），MINI App 的開關位置：**未驗證**，請在 **Web app settings** 找〕
6. 記下 **Developing** 和 **Published** 各自的 **LIFF ID**（格式像 `1234567890-AbcdEfgh`）和 **Channel ID**。Published 的資料在右上角 **Published Data**。
   〔三個 internal channel 的 Channel ID 是否各不相同：**未驗證**；ID token 的 `aud` 會是 LIFF 所在的 channel，驗證時要用對應的 Channel ID〕
7. 自己手機要能開 Developing 版：到 **Roles** 把自己加成 tester。〔[Managing roles](https://developers.line.biz/en/docs/line-developers-console/managing-roles/)〕

### 3.3 （備案 / 選用）LINE Login channel + LIFF app

只有在 MINI App channel 建不起來，或之後需要傳統網頁 OAuth 時才做。官方文件：[LINE Login getting started](https://developers.line.biz/en/docs/line-login/getting-started/) · [Integrate LINE Login](https://developers.line.biz/en/docs/line-login/integrate-line-login/)

1. Provider `PIKYOO` → **Create a new channel** → **LINE Login**。Region `Taiwan`，**App types** 勾 **Web app**，Channel name 不能含 "LINE"。
2. **LINE Login** 分頁 → **Callback URL**：可以填多行（每行一個），填 Production、Preview 分支、tunnel 的網址。
   〔只用 `liff.login()` 時是否一定要填 Callback URL：**未驗證**；填了不會有壞處〕
3. **Basic settings** → **OpenID Connect** → **Email address permission** → **Apply**：要上傳「告知使用者會蒐集 email 與用途」的畫面截圖。選用，審查時間**未驗證**。
4. **LIFF** 分頁 → **Add**：
   - **LIFF app name**：`PIKYOO`
   - **Size**：**Full**
   - **Endpoint URL**：Production 網址（建議另外加一個 `PIKYOO dev` LIFF app 指向 Preview 網址；每個 channel 最多 30 個 LIFF app）
   - **Scopes**：`openid`、`profile`
   - **Add friend option**：**On (normal)**
   - **Scan QR** / **Module mode**：Off
5. 同一個 **LIFF** 分頁點 **shareTargetPicker** → 勾同意 → **Enable**。
6. 記下 **LIFF ID**、**Channel ID**；**Channel secret** 只放進環境變數。

### 3.4 LINE 官方帳號「PIKYOO 匹友」+ Messaging API

官方文件：[Messaging API getting started](https://developers.line.biz/en/docs/messaging-api/getting-started/) · [Add friend option / link a bot](https://developers.line.biz/en/docs/line-login/link-a-bot/)

1. 到 LINE Official Account Manager <https://manager.line.biz/> → 用同一個 LINE 帳號登入 → 建立官方帳號：名稱 `PIKYOO 匹友`，類別選運動相關。一般（未認證）帳號建立後馬上能用。
2. 在 Manager 裡：**設定** → **Messaging API** → **啟用 Messaging API**。
   ⚠️ 選擇 Provider 時一定要選 **`PIKYOO`**。**選了就不能改也不能取消。** Messaging API channel 現在只能從這裡建立。
3. 回 LINE Developers Console：Provider `PIKYOO` 下會出現新的 Messaging API channel。
   - **Basic settings**：記下 **Channel secret**（之後驗證 webhook 簽章用）
   - **Messaging API** 分頁：**Channel access token** → **Issue**（之後推播用）
   - **Webhook URL** 等 Claude 做好 `/api/line/webhook` 再填
4. **連結官方帳號**：MINI App channel（或 LINE Login channel）→ **Basic settings** → **Linked LINE Official Account** → **Edit** → 選 `PIKYOO 匹友` → **Update**。
   條件：兩者在同一個 Provider，而且你是兩邊的 admin。連結後，同意畫面會出現「加入好友」選項。
5. **圖文選單**（先用 Manager 手動做，不用寫程式）：Manager → **主頁** → **圖文選單** → 建立 → 版型選 4 格：找球局／開團／找教練／我的。
   每格動作選「連結」，填 `https://miniapp.line.me/{Published LIFF ID}/games` 這種格式：LIFF URL 後面加的 path 會接到 Endpoint URL 後面。〔[Opening a LIFF app](https://developers.line.biz/en/docs/liff/opening-liff-app/)；Manager 中文選單名稱依介面為準〕
6. 暫時保留 Manager 的自動回應。之後接 webhook 時，再到 **回應設定** 調整，避免兩邊重複回覆。

---

## 4. LINE × Supabase Auth：怎麼接

### 4.1 查證結果

- Supabase Auth **目前沒有內建 LINE provider**。官方 social login 清單裡沒有 LINE。有人提了社群 PR（[supabase/auth#2578](https://github.com/supabase/auth/pull/2578)，2026-06 仍是 open），而且它只支援網頁 redirect 流程，明確不支援 ID token 登入。〔[Social login](https://supabase.com/docs/guides/auth/social-login)〕
- Supabase 在 2026/04 推出 **Custom OAuth/OIDC Providers**（Free 方案最多 3 個，識別碼要以 `custom:` 開頭）。〔[Custom providers](https://supabase.com/docs/guides/auth/custom-oauth-providers)〕
  但 LINE 的 discovery 文件宣稱簽章是 ES256，**網頁登入實際發的 ID token 卻是 HS256**（用 channel secret 簽）。所以用 OIDC 模式接 LINE 會驗證失敗。〔[LINE 驗證 ID token](https://developers.line.biz/en/docs/line-login/verify-id-token/)、[discovery](https://access.line.me/.well-known/openid-configuration)〕
  社群的繞法是改用「手動 OAuth2 + userinfo endpoint」（[zenn 文章](https://zenn.dev/sasatech/articles/02b8fb72b45cdd?locale=en)，非官方）。
- LINE 官方明寫：**在 LIFF browser 內發 LINE Login 授權請求，行為不保證**，要改用 `liff.login()`。〔[Developing a LIFF app](https://developers.line.biz/en/docs/liff/developing-liff-apps/)〕
  → 所以 LINE 內不能靠 Supabase 的 OAuth redirect 流程。

### 4.2 推薦做法：「LIFF ID token 換 Supabase session」（Next.js Route Handler）

```text
[LINE 內 / 外部瀏覽器] liff.init()（外部瀏覽器再呼叫 liff.login()）
        │ liff.getIDToken()  ← ES256，有效 1 小時
        ▼
[Next.js Route Handler  POST /api/auth/line]  （伺服器端）
  1. POST https://api.line.me/oauth2/v2.1/verify  (id_token + client_id=LINE Channel ID)
  2. 用 sub（LINE user ID）找 / 建 Supabase user（Admin API，用 SUPABASE_SECRET_KEY）
  3. 用 Supabase Admin 產生一次性登入 token → 伺服器端換成 session，透過 @supabase/ssr 寫入 cookie
        ▼
[之後] 跟 Email 登入一樣是普通 Supabase session，RLS 用 auth.uid()
```

**為什麼選這個：**
- 一條路徑同時涵蓋 LINE 內（自動登入）和外部瀏覽器（`liff.login()`），不用維護兩套 LINE 身分。
- 只依賴兩家的**官方 API**：LINE 的 verify endpoint、Supabase 的 Admin API。不依賴 HS256 的社群繞法，也不用等上游 PR。
- 符合 PRD §8「伺服器端驗證 LIFF ID token」。
- 放在 Next.js Route Handler：session cookie 直接寫在同網域，最簡單。之後做原生 App 時，可以搬到 Supabase Edge Function 共用。

**你需要設定的（實作交給 Claude）：**
1. MINI App（或 LIFF app）的 Scopes 勾 **`openid`**（必要）和 `profile`。
2. 環境變數：`NEXT_PUBLIC_LIFF_ID`、`LINE_CHANNEL_ID`、`SUPABASE_SECRET_KEY`（見 §5）。
3. Supabase：Email provider 保持開啟；不需要在 Supabase 設定 LINE provider。
4. 不需要 LINE 的 Channel secret（verify endpoint 只需要 Channel ID）。

---

## 5. 填好之後交給 Claude 的清單

### 5.1 你自己填進 `web/.env.local`（本機）和 Vercel Environment Variables

```bash
# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx                  # 🔒 secret
# --- LINE（本機 / Preview 用 Developing 的值；Production 用 Published 的值）---
NEXT_PUBLIC_LIFF_ID=1234567890-AbcdEfgh
LINE_CHANNEL_ID=1234567890
# --- LINE Messaging API（之後做通知時再填）---
LINE_MESSAGING_CHANNEL_SECRET=xxx                  # 🔒 secret
LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=xxx            # 🔒 secret
```

Vercel 上的分法：`NEXT_PUBLIC_LIFF_ID` / `LINE_CHANNEL_ID` 在 **Production** 填 Published 的值，在 **Preview** / **Development** 填 Developing 的值。其他變數三個環境都填 `pikyoo-dev` 的值，等 `pikyoo-prod` 建好再把 Production 換掉。

### 5.2 可以直接告訴 Claude 的（非機密識別碼）

- [ ] Vercel Production 網址、Vercel scope slug
- [ ] Supabase **project ref**、Project URL、Region
- [ ] （可以，但不必要）Supabase publishable key：本來就會公開
- [ ] LINE Provider 名稱、MINI App **Channel ID**、**LIFF ID**（Developing / Published）
- [ ] 官方帳號 Basic ID（`@xxxxxxx`）、是否已連結 channel、shareTargetPicker 是否已開啟

### 5.3 🔒 絕對不要貼到聊天室（只放 `.env.local` / Vercel 設定）

- Supabase **secret key**（`sb_secret_…`）、legacy `service_role`、**Database Password**
- 任何 LINE **Channel secret**、Messaging API **Channel access token**
- Vercel / Supabase 的個人 access token

---

## 6. 常見卡關

| 症狀 | 原因 / 解法 |
|---|---|
| Vercel build 失敗、找不到 `package.json` | **Root Directory** 沒設成 `web`（Settings → Build and Deployment → Root Directory） |
| 頁面很慢，每個請求都多 200ms 以上 | Function 區域還是 `iad1`，改成 `hnd1`（§1 第 6 步） |
| 在 LINE 開 Preview 網址卻跳出 Vercel 登入 | Preview 開了 Deployment Protection（§1 第 8 步） |
| LIFF 開啟後空白 / 報錯 | ① Endpoint URL 和實際部署網址不一致 ② `liff.init()` 用的 LIFF ID 跟 internal channel 不符（Developing / Published 是不同 ID） |
| 外部瀏覽器 `liff.login()` 出現錯誤頁 | `redirectUri` 沒有以 Endpoint URL 開頭；Endpoint 建議設成網站根目錄 |
| ID token 驗證失敗 | `client_id` 用錯 channel、token 過期（1 小時）、沒勾 `openid` scope |
| 同一個人變成兩個帳號 | channel 分散在不同 Provider → user ID 不同。Provider 無法搬移，一開始就全部放 `PIKYOO` |
| Developing 版手機打不開 | 自己沒加成 tester（Roles），或手機 LINE 帳號不是 console 登入的那個 |
| 在 LINE 內點 Google 登入失敗 | Google 不允許在內嵌瀏覽器登入。LINE 內只提供 LINE 登入；Google / Email 請使用者改用外部瀏覽器 |
| LINE 一般聊天室的連結 ≠ LIFF | 一般連結在「LINE in-app browser」開，不是 LIFF browser。要用 `https://miniapp.line.me/{liffId}` 才會進 LIFF |
| Magic link 登入後跳回 localhost | Supabase **Site URL** / **Redirect URLs** 沒加正式網址或 Preview 網址（§2.4） |
| Supabase 突然連不上 / API 報錯 | Free 專案一週無活動被暫停 → dashboard 按 **Restore**；上線後改用 Pro |
| 透過 tunnel 跑 `next dev`，頁面資源或 HMR 被擋 | Next.js 會擋非 localhost 的 dev 來源，需要在 `next.config.ts` 加 `allowedDevOrigins`（交給 Claude 改） |
| shareTargetPicker 沒反應 | console 沒啟用 / 沒同意 Agreement |
| 圖文選單點了沒進 app 的指定頁 | 連結要用 LIFF URL + path，不要直接用 vercel.app 網址 |
| 2026/10/07 之後 LIFF URL 參數怪怪的 | LINE 公告 LIFF URL query 參數值中 `?` 的處理方式會改變〔[2026 News](https://developers.line.biz/en/news/2026/)〕 |

---

## 7. 尚未驗證 / 需要你在 console 確認的事

1. MINI App channel 的 **shareTargetPicker** 開關在哪裡；三個 internal channel 的 **Channel ID** 是否各自不同。
2. 台灣 MINI App：政策頁寫「需 LY 核准」，但 2026/03/11 公告寫「任何 permitted customer 都能建」，兩邊矛盾。
3. MINI App channel 能不能申請 email 權限（目前沒有需要）。
4. 只用 `liff.login()` 時，LINE Login channel 是否必須設定 Callback URL。
5. Vercel 新專案的 Deployment Protection 預設值；ngrok 免費方案是否附固定網域。
6. LINE email 權限的審查時間；官方帳號 Manager 的中文選單名稱（依你看到的介面為準）。
7. Supabase Custom OAuth2 接 LINE 的社群繞法只有第三方文章佐證，沒有 Supabase 官方說明（本指南沒有採用）。
