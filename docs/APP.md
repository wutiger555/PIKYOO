# PIKYOO 原生 App 計畫

> 決定日期：2026-10-04。本文件說明 PIKYOO 原生 App（iOS／Android）的技術路線、架構、上架流程，以及網頁與 App 並存時的維護規則。
> 相關文件：`PLAN.md` §11（平台形式決策，§11.4 觸發條件、§11.5 路線）、`PRD.md` §3／Phase 4、`BACKEND.md`（資料層與階段 B1–B8）。

---

## 1. 決策摘要

| 項目 | 決定 |
|---|---|
| 技術路線 | **React Native + Expo**（TypeScript） |
| 不採用 | Capacitor（團隊不熟、手感接近網頁）、Flutter（新語言、無法共用現有程式碼）、原生雙平台（兩份程式碼） |
| 打包上架 | 初期用 **Xcode／Android Studio 手動打包**；不依賴 EAS 雲端打包 |
| 免審核更新 | **EAS Update**（免費額度內），必要時可改自架更新伺服器 |
| 平台 | **iOS 與 Android 同時上架**（同一套程式碼，多出的只有測試與上架） |
| App 範圍 | 學員核心流程；教練後台與完整功能留在網頁 |
| 開始時間 | **一定會做**（owner 2026-10-04 確認）。時間照計畫：PRD Phase 4，B1–B8 真資料穩定、正式站有真實使用者之後（見 §8、`PLAN.md` §11.4） |

---

## 2. 為什麼是 React Native + Expo

| | **React Native + Expo** | Flutter | Capacitor | 原生（Swift + Kotlin） |
|---|---|---|---|---|
| 團隊經驗 | ✅ 上架過 RN | ❌ | ❌ | ❌ |
| 語言 | TypeScript（同網站） | Dart | TypeScript（同網站） | Swift + Kotlin |
| 與網站共用 | ✅ 型別、Supabase 查詢、規則、假資料 | ❌ | ✅ 幾乎全部（含畫面） | ❌ |
| 手感 | 接近原生 | 接近原生 | 接近網頁 | 原生 |
| AI 撰寫 | ⭐ TS/React 最熟，網站與 App 同 repo 同語言 | 好 | ⭐ | 需寫兩份 |
| 免審核更新 | ✅ EAS Update（官方） | ⚠️ 第三方（Shorebird） | ✅（載入線上網站） | ❌ |
| 維護 | 中：Expo SDK 每年升級 2–3 次 | 中 | 低 | 高 |

- **Expo ≠ EAS。** Expo 是免費開源的開發框架，在本機執行；EAS 是 Expo 公司的雲端服務（打包、上架、更新），可選用。React Native 官方文件現在也建議從 Expo 開始。
- **Capacitor** 是可行的（Burger King、BBC、AAA 等在用），但團隊沒有經驗，且手感上限是網頁。若日後只想用最低成本「有個 App」，它仍是備案。

---

## 3. 架構

```text
PIKYOO/（一個 repo，npm workspaces）
├─ web/            Next.js + Tailwind               → Vercel 自動部署（不變）
├─ app/            Expo + Expo Router + NativeWind  → Xcode / Android Studio 上架
├─ packages/core/  兩邊共用（純 TypeScript，不含畫面），import 寫 `@pikyoo/core/<檔名>`
│   └─ src/
│       ├─ types.ts      畫面用的型別（PRD §7）；之後加 Supabase 產生的資料表型別
│       ├─ data/         假資料（demo）；B1 重做時加入 Supabase 查詢（live）
│       ├─ format.ts     程度、價格顯示
│       └─ contact.ts    問與答的聯絡方式過濾
└─ supabase/       規則、權限、RPC、Edge Functions（兩邊唯一的大腦）
```

**原則：規則只寫一次，畫面各寫一份。**

| 層 | 寫幾次 | 例子 |
|---|---|---|
| 資料庫規則（`supabase/`） | 1 次 | 名額、候補、問與答不能留 LINE |
| 共用邏輯（`packages/core`） | 1 次 | 查教練列表、價格顯示、聯絡方式過濾 |
| 畫面（`web/`、`app/`） | 2 次 | 網頁版教練頁、App 版教練頁 |

- `NEXT_PUBLIC_DATA_SOURCE=demo|live` 的模式延續到 App（`EXPO_PUBLIC_DATA_SOURCE`），demo 版 App 也能跑。
- `packages/core` 已於 2026-10-04 建立，搬入型別、假資料、`format`、`contact`。`demo-store.tsx`（React 狀態）仍在 `web/`，App 開工時再決定是否共用。

---

## 4. App 範圍

| 放進 App（學員常用） | 只留在網頁 |
|---|---|
| 找教練、教練頁、預約課程 | 教練後台（ConsoleFrame，桌機用） |
| 我的課程、取消／改期 | 團主開團工具（初期） |
| 揪團瀏覽與報名 | SEO 落地頁、LINE 入口 |
| 通知中心、推播 | 管理功能 |
| 問與答（F3-11） | |

新功能**先上網站**，確認有人用再搬到 App。

---

## 5. 技術選擇

| 項目 | 選擇 | 說明 |
|---|---|---|
| 框架 | Expo（最新 SDK）+ TypeScript | |
| 路由 | Expo Router | 資料夾即分頁，跟 Next.js App Router 同概念 |
| 樣式 | NativeWind | 用 Tailwind 寫法排版 |
| 登入 | Supabase Auth + LINE 登入 + **Apple 登入** | 網站與 App 同一個帳號；iOS 提供第三方登入時須附 Apple 登入（App Store 審核規範 4.8） |
| 推播 | Supabase「通知」表 → Edge Function 依使用者分發到 App 推播／Web Push／LINE | 規則寫一次，各管道各自送 |
| 連結 | Universal Links（iOS）／App Links（Android） | 有裝 App 點教練頁直接開 App，沒裝看網頁；需先有自有網域 |
| 錯誤監控 | Sentry（網站與 App 共用） | |
| 自動測試 | 網站 Playwright（已在用）、App Maestro | |
| AI 開發 | Claude Code 同時改 `web/`、`app/`、`packages/core` | 可操作 iOS 模擬器自行驗證 |

---

## 6. 打包與上架

### 6.1 打包方式

```text
npx expo prebuild        ← 產生標準 ios/、android/ 原生專案
open ios/*.xcworkspace   ← Xcode → Product → Archive → Distribute → App Store Connect
android/ 用 Android Studio 產生 .aab → 上傳 Google Play Console
```

| 方式 | 費用 | 何時用 |
|---|---|---|
| **Xcode／Android Studio 手動** | 免費 | **初期預設**，每月上架一兩次 |
| `eas build --local` | 免費 | 想用一個指令在自己 Mac 上打包 |
| GitHub Actions + Fastlane | Mac 執行時間計費 | 上架變頻繁後 |
| EAS 雲端打包 | 超過免費額度付費 | 沒有 Mac 或不想管憑證 |

### 6.2 帳號（上架前完成）

- **用公司身份註冊** Apple Developer Program（US$99／年）與 Google Play Console（US$25 一次），需先申請**鄧白氏編號（D-U-N-S）**。商店顯示公司名稱，較有信任感。
- Google Play **個人帳號**新上架須先有 12 位測試者封閉測試 14 天；公司帳號不受此限。

### 6.3 Apple 審核重點

- 有 LINE 登入 → 必須另提供 **Apple 登入**。
- **App 內可刪除帳號**（B2 已規劃）。
- 教練課與場地是**實體服務**，依審核指南 3.1.3(e) 可用自有金流，不必走 Apple 內購；若未來販售數位功能（例如教練會員訂閱的線上功能），需重新確認是否須走內購。
- 送審需**真資料與審核用測試帳號**，demo 假資料階段送審容易被退件。

### 6.4 發布節奏

| 改了什麼 | 怎麼發布 | 生效 |
|---|---|---|
| 網站 | 合併到 `main`，Vercel 自動部署（不變） | 立即 |
| App 只改畫面／邏輯（JS） | EAS Update 推送，分「測試」「正式」管道，可一鍵退回 | 當天 |
| App 動到原生（新權限、新原生套件、SDK 升級） | 打包送審，先 TestFlight／封閉測試 | 約每月一次 |

---

## 7. 網頁與 App 並存的維護規則

1. **App 舊版本會一直存在。**
   - 資料庫只做**加法**：新增欄位、表、RPC；不隨意改名或刪除。
   - RPC 要改行為時開新版本（例如 `book_lesson_v2`），舊的保留到最低支援版本之後。
   - 設定表記錄**最低支援 App 版本**，太舊的 App 要求更新。
2. **不是每個功能兩邊都要有**（見 §4）。
3. **發布節奏分開**（見 §6.4）。
4. **每個 PR 註明影響層**：`db`／`core`／`web`／`app`。demo 假資料與 live 介接一起更新（延續 `BACKEND.md` §1.3）；改規則時 `packages/core/src/contact.ts` 與 `public.contact_kind()` 一起改。
5. **Apple 審核用帳號**：在正式環境保留一組審核專用帳號與示範資料。

---

## 8. 進度表

對應 PRD §12 的 Phase 4。是順序與進入條件，不是固定日期。**每完成一步就在這裡打勾**（狀態：✅ 完成、👉 進行中、⬜ 未開始）。

> **目前位置（2026-10-05）：第二階段第 10 步，B7 營運後台與 SEO。** B6 完成：站內通知、LINE 推播（官方帳號「PIKYOO 匹友」）、前一天提醒都已上線；Email 等需要時再接。正式站啟用真登入等 owner 決定時間（`BACKEND.md` §13）。

### 第一階段：決定方向

| # | 步驟 | 負責 | 狀態 |
|---|---|---|---|
| 1 | 決定 React Native + Expo，寫 APP.md | — | ✅ [#14](https://github.com/wutiger555/PIKYOO/pull/14) |
| 2 | 建 `packages/core`，搬移共用程式 | Claude | ✅ [#15](https://github.com/wutiger555/PIKYOO/pull/15) |
| 3 | Owner 本機改成在 repo 根目錄 `npm install` | owner | ✅ |

### 第二階段：網站接真資料（`BACKEND.md` B1–B8）

App 等網站資料穩定才開工，避免兩邊一起追資料結構變動。B1–B6 完成後資料結構已大致定下來，所以 **B7 完成就開工**（2026-10-05 owner 決定提前，見 `PLAN.md` D8），B8 與第四階段同時進行。

| # | 步驟 | 負責 | 狀態 |
|---|---|---|---|
| 4 | B1 重新上線：球場、教練、球局改讀資料庫；Supabase 查詢寫在 `packages/core` | owner＋Claude | ✅ [#17](https://github.com/wutiger555/PIKYOO/pull/17) |
| 5 | B2 登入：LINE 登入、我的、刪除帳號（正式站等 B3 一起啟用；隱私權政策頁待 owner 資料） | owner＋Claude | ✅ [#18](https://github.com/wutiger555/PIKYOO/pull/18)、[#19](https://github.com/wutiger555/PIKYOO/pull/19) |
| 6 | B3 球局：報名、候補、開團、編輯、分享、兩週列表 | Claude | ✅ [#20](https://github.com/wutiger555/PIKYOO/pull/20)–[#24](https://github.com/wutiger555/PIKYOO/pull/24) |
| 7 | B4 教練頁與後台：申請、編輯存檔、照片與證照上傳、管理員審核 | owner＋Claude | ✅ [#25](https://github.com/wutiger555/PIKYOO/pull/25)–[#27](https://github.com/wutiger555/PIKYOO/pull/27) |
| 8 | B5 預約、問與答、收款（揪朋友一起上先只在 demo，PLAN D7） | Claude | ✅ [#29](https://github.com/wutiger555/PIKYOO/pull/29)–[#32](https://github.com/wutiger555/PIKYOO/pull/32) |
| 9 | B6 通知：LINE 推播、Email、提醒 | owner＋Claude | ✅ |
| 10 | B7 營運後台與 SEO | Claude | 👉 |
| 11 | B8 封測：清掉示範資料、放入真實球場 | owner＋Claude | ⬜ |

### 第三階段：上架前準備（需要等審核，**現在就可以和第二階段同時進行**）

| # | 步驟 | 負責 | 狀態 |
|---|---|---|---|
| 12 | 申請鄧白氏編號（D-U-N-S），免費，可能要等一到幾週 | owner | ⬜ |
| 13 | Apple Developer Program 公司帳號（US$99／年，需第 12 項） | owner | ⬜ |
| 14 | Google Play Console 公司帳號（US$25 一次；免「12 人測 14 天」） | owner | ⬜ |
| 15 | 自有網域（如 pikyoo.tw），Universal Links 需要 | owner | ⬜ |

### 第四階段：App 開發

進入條件（2026-10-05 修改）：B7 完成即開工，不等 B8 與 `PLAN.md` §11.4 觸發條件；上架（第五階段）仍要等第三階段帳號與 B8 真實資料。

| # | 步驟 | 負責 | 狀態 |
|---|---|---|---|
| 16 | 建 `app/`（Expo 骨架），接 `packages/core`，先用假資料跑 | Claude | ⬜ |
| 17 | 登入：LINE＋Apple 登入，跟網站共用帳號 | Claude | ⬜ |
| 18 | 學員核心畫面：找教練、教練頁、預約、我的課程、揪團、問與答（§4） | Claude | ⬜ |
| 19 | 推播通知（§5） | Claude | ⬜ |
| 20 | 內部試用：TestFlight／Google 封閉測試 | owner＋Claude | ⬜ |

### 第五階段：上架

| # | 步驟 | 負責 | 狀態 |
|---|---|---|---|
| 21 | iOS 與 Android 同時送審上架（§6） | owner＋Claude | ⬜ |
| 22 | Universal Links／App Links：網站連結直接開 App | Claude | ⬜ |
| 23 | 之後小更新用 EAS Update 推送（§6.4） | Claude | ⬜ |
