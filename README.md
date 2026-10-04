# PIKYOO｜匹友

A pickleball platform for Taiwan to find courts, coaches, classes, and games.

> Find your court. Find your coach. Find your game.
> 找場、找課、找球友。

## 正式網址

**<https://pikyoo.vercel.app>**：`main` 分支的最新版，每次合併到 `main` 後 Vercel 會自動重新部署（約 1–2 分鐘）。

| 想看 | 網址 |
|---|---|
| 首頁 | <https://pikyoo.vercel.app/> |
| 找教練、教練頁 | <https://pikyoo.vercel.app/coaches>、<https://pikyoo.vercel.app/coaches/mia> |
| 教練後台 | <https://pikyoo.vercel.app/coach> |
| 球局、球場 | <https://pikyoo.vercel.app/games>、<https://pikyoo.vercel.app/courts> |
| 設計系統與所有流程總表 | <https://pikyoo.vercel.app/design> |

- 手機與電腦都能看：寬度 1024px 以上是電腦版，640–1023px 是加寬的手機版。
- 目前是 **Demo**：資料都是假資料、存在瀏覽器記憶體裡，**重新整理就會還原**。
- **看訪客畫面**：在「我的」或電腦版右上角頭像選單按「登出（Demo：看訪客畫面）」。登入框按「用 LINE 登入」就會切回來。
- **分支預覽**：推到其他分支時，Vercel 會產生預覽網址 `pikyoo-git-<分支名>-max-x1.vercel.app`（同一個分支永遠是同一個網址），只有登入 Vercel 的人看得到，不影響正式網址。

## 更新紀錄

| 日期 | PR | 內容 |
|---|---|---|
| 2026-10-04 | [#20](https://github.com/wutiger555/PIKYOO/pull/20) | **B3 第一部分：報名球局接上資料庫**：報名、加入候補、取消都寫進資料庫（真登入啟用後生效），取消前會先跳出確認並說明晚取消的規則。示範網站也有取消確認 |
| 2026-10-04 | [#19](https://github.com/wutiger555/PIKYOO/pull/19) | **LINE 登入實測通過**（Preview）。修掉測試時發現的三個問題：LINE 帳號沒對應好會重複建帳號、首次設定中途離開會遺失、登入後右上角要重新整理才顯示名字。正式站先維持示範登入，等 B3 報名球局做完再一起啟用 |
| 2026-10-04 | [#18](https://github.com/wutiger555/PIKYOO/pull/18) | **B2 登入（第一部分）**：LINE 登入、首次登入設定存檔、登出、刪除帳號都接上資料庫，等 LINE channel 建好、Vercel 設定 LIFF ID 後才啟用，**現在網站行為不變**。修掉一個資安漏洞：別人可以用 Email 註冊冒用你的 LINE 身分（[BACKEND.md](docs/BACKEND.md) §5） |
| 2026-10-04 | [#17](https://github.com/wutiger555/PIKYOO/pull/17) | **正式網址改讀資料庫（B1 重新上線）**：球場、教練、球局來自 Supabase。讀資料的程式放在 `packages/core`，之後 App 共用。10/3 掛掉的原因是 Vercel 的 Supabase 網址少一個字；現在設定有誤時**建置會直接失敗**，正式站維持上一版，不會再整站 500 |
| 2026-10-04 | [#16](https://github.com/wutiger555/PIKYOO/pull/16) | 文件：[APP.md](docs/APP.md) §8 改成原生 App 的進度表（五個階段、23 步，標示目前位置與負責人） |
| 2026-10-04 | [#15](https://github.com/wutiger555/PIKYOO/pull/15) | 程式整理：建立 `packages/core`（npm workspaces），把型別、假資料、程度與價格格式、聯絡方式過濾從 `web/` 搬過去，之後原生 App 可直接共用（[APP.md](docs/APP.md) §3）。網站畫面沒有改變 |
| 2026-10-04 | [#14](https://github.com/wutiger555/PIKYOO/pull/14) | 文件：決定原生 App 路線為 **React Native + Expo**（不用 Capacitor／Flutter），新增 [APP.md](docs/APP.md)：架構、上架流程、網頁與 App 並存的維護規則；更新 PLAN §11.5、PRD Phase 4 |
| 2026-10-03 | [#12](https://github.com/wutiger555/PIKYOO/pull/12) | 撤回 #11：正式網址切到資料庫後每頁都打不開（約 6 分鐘），先回到 Demo 資料，查 Vercel 環境變數後再重新上線（[BACKEND.md](docs/BACKEND.md) §13） |
| 2026-10-03 | [#11](https://github.com/wutiger555/PIKYOO/pull/11) | 接真的資料 B1：球場、教練、球局改從「資料來源」讀取，`NEXT_PUBLIC_DATA_SOURCE=live` 讀 Supabase，沒設定維持 Demo 假資料；修掉 Supabase 安全檢查的 5 個警告。**已被 #12 撤回** |
| 2026-09-30 | [#10](https://github.com/wutiger555/PIKYOO/pull/10) | 揪朋友一起上：湊人期間保留「成員數與最少人數取大者」的名額，避免陌生人先訂走、揪團湊不齊；Supabase `pikyoo-dev` 已套用資料庫與 seed 並通過自動檢查（[BACKEND.md](docs/BACKEND.md) §4.2、§13）。網站畫面沒有改變 |
| 2026-09-30 | [#9](https://github.com/wutiger555/PIKYOO/pull/9) | 文件：確定正式版＝原本的 Vercel `pikyoo` + Supabase `pikyoo-dev`，Demo 另開 `pikyoo-demo`；Supabase MCP 設定方式、Vercel 免費版限制、目前進度（[BACKEND.md](docs/BACKEND.md) §9.4、§9.5、§13） |
| 2026-09-30 | [#8](https://github.com/wutiger555/PIKYOO/pull/8) | 開始接真的資料（B0）：[後端與真實資料規劃](docs/BACKEND.md)，Demo 版用同一份程式碼保留在獨立網址；Supabase 資料庫（17 張表、權限規則、報名／候補／預約／揪團／收款／問與答函式、照片儲存）、由 mock 產生的 seed、自動檢查與 CI。網站畫面沒有改變 |
| 2026-09-30 | [#7](https://github.com/wutiger555/PIKYOO/pull/7) | 文件：[商業模式與收費設計（草案）](docs/BUSINESS_MODEL.md)，含教練平台費（首堂 12%／回頭 3%）、Pro 訂閱、學生不收服務費、匹克球場地溢價與場館時段機會、收入估算與待決定事項 |
| 2026-09-30 | [#6](https://github.com/wutiger555/PIKYOO/pull/6) | 文件：README 寫上正式網址與更新紀錄、新增給 AI 助理的專案說明 `CLAUDE.md`、`web/README` 與設計系統文件補上電腦版與訪客限制 |
| 2026-09-30 | [#5](https://github.com/wutiger555/PIKYOO/pull/5) | **電腦版全部完成**（[DESKTOP.md](docs/DESKTOP.md)）：頂部導覽、教練頁右側預約卡、找教練篩選欄與比較表、首頁兩欄、預約與球場兩欄、教練後台左側選單＋表格、其他頁面置中單欄。**訪客限制**：未登入只看教練的照片、認證、價格、自介，其餘登入解鎖；訪客首頁引導「用 LINE 免費註冊」 |
| 2026-09-29 | [#4](https://github.com/wutiger555/PIKYOO/pull/4) | 教練頁 **問與答** 取代「用 LINE 問問題」，擋掉電話／LINE／Email，避免學生與教練私下約課；教練後台可回覆 |
| 2026-09-29 | [#3](https://github.com/wutiger555/PIKYOO/pull/3) | 教練與球場照片換成 Unsplash 免費圖庫的示意照（清單與授權見 [PHOTOS.md](docs/PHOTOS.md)） |
| 2026-09-29 | [#2](https://github.com/wutiger555/PIKYOO/pull/2) | 以課程為主的改版：教練頁、揪朋友一起上課、教練後台編輯器 |
| 2026-09-29 | [#1](https://github.com/wutiger555/PIKYOO/pull/1) | Claude Design 設計稿做成 Next.js MVP（`web/`） |

## 文件

- [產品計劃書（MVP PRD）v1.0](docs/PRD.md)：功能規格、流程、資料模型、時程
- [市場分析與產品策略 v0.3](docs/PLAN.md)：競品、差異化、可行性、金流與平台決策
- [商業模式與收費設計（草案）](docs/BUSINESS_MODEL.md)：教練平台費（首堂 12%／回頭 3%）、Pro 訂閱、場館與匹克球溢價、收入估算、待決定事項
- [品牌與 UI/UX 設計簡報 v1.0](docs/BRAND_DESIGN_BRIEF.md)：給 Claude Design 的 Logo 與設計系統簡報
- [設計系統](docs/DESIGN_SYSTEM.md)：螢光球 × 碳纖維，token、元件與規則
- [電腦版設計規劃與實作狀態](docs/DESKTOP.md)：斷點、元件對應、每頁版型、已確認的決定
- [Demo 照片清單](docs/PHOTOS.md)：每張照片的來源、攝影師與授權
- [帳號與雲端服務設定指南](docs/SETUP.md)：Vercel、Supabase、LINE（MINI App／官方帳號）照順序設定
- [後端與真實資料規劃](docs/BACKEND.md)：Demo 版怎麼保留、架構、資料庫與權限設計、登入、通知、分階段實作（B1–B8）

## 程式

`web/` 是 MVP 的 Next.js 專案（目前用 mock data），怎麼跑、路由與結構見 [web/README.md](web/README.md)。

`supabase/` 是資料庫：`migrations/`（資料表、權限規則、報名等函式）、`seed.sql`（由 mock 資料產生的開發用資料）、`dev/`（不需要 Docker 的本機檢查）。說明見 [docs/BACKEND.md](docs/BACKEND.md)。

## 開發流程

1. 在分支上改 → 本機跑 `npm run build`、`npx tsc --noEmit`、`npm run lint`，並用瀏覽器截圖檢查手機與電腦版。
2. 開 PR → 檢查都通過就合併到 `main`。
3. 合併後看正式網址 <https://pikyoo.vercel.app>。

目前是 Demo 階段，改動合併後直接上正式網址；等有真實使用者後，改成先看分支預覽、確認後再合併。給 AI 助理（Claude Code）的專案規則在 [CLAUDE.md](CLAUDE.md)。
