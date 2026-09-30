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
| 2026-09-30 | [#6](https://github.com/wutiger555/PIKYOO/pull/6) | 文件：README 寫上正式網址與更新紀錄、新增給 AI 助理的專案說明 `CLAUDE.md`、`web/README` 與設計系統文件補上電腦版與訪客限制 |
| 2026-09-30 | [#5](https://github.com/wutiger555/PIKYOO/pull/5) | **電腦版全部完成**（[DESKTOP.md](docs/DESKTOP.md)）：頂部導覽、教練頁右側預約卡、找教練篩選欄與比較表、首頁兩欄、預約與球場兩欄、教練後台左側選單＋表格、其他頁面置中單欄。**訪客限制**：未登入只看教練的照片、認證、價格、自介，其餘登入解鎖；訪客首頁引導「用 LINE 免費註冊」 |
| 2026-09-29 | [#4](https://github.com/wutiger555/PIKYOO/pull/4) | 教練頁 **問與答** 取代「用 LINE 問問題」，擋掉電話／LINE／Email，避免學生與教練私下約課；教練後台可回覆 |
| 2026-09-29 | [#3](https://github.com/wutiger555/PIKYOO/pull/3) | 教練與球場照片換成 Unsplash 免費圖庫的示意照（清單與授權見 [PHOTOS.md](docs/PHOTOS.md)） |
| 2026-09-29 | [#2](https://github.com/wutiger555/PIKYOO/pull/2) | 以課程為主的改版：教練頁、揪朋友一起上課、教練後台編輯器 |
| 2026-09-29 | [#1](https://github.com/wutiger555/PIKYOO/pull/1) | Claude Design 設計稿做成 Next.js MVP（`web/`） |

## 文件

- [產品計劃書（MVP PRD）v1.0](docs/PRD.md)：功能規格、流程、資料模型、時程
- [市場分析與產品策略 v0.3](docs/PLAN.md)：競品、差異化、可行性、金流與平台決策
- [品牌與 UI/UX 設計簡報 v1.0](docs/BRAND_DESIGN_BRIEF.md)：給 Claude Design 的 Logo 與設計系統簡報
- [設計系統](docs/DESIGN_SYSTEM.md)：螢光球 × 碳纖維，token、元件與規則
- [電腦版設計規劃與實作狀態](docs/DESKTOP.md)：斷點、元件對應、每頁版型、已確認的決定
- [Demo 照片清單](docs/PHOTOS.md)：每張照片的來源、攝影師與授權
- [帳號與雲端服務設定指南](docs/SETUP.md)：Vercel、Supabase、LINE（MINI App／官方帳號）照順序設定

## 程式

`web/` 是 MVP 的 Next.js 專案（目前用 mock data），怎麼跑、路由與結構見 [web/README.md](web/README.md)。

## 開發流程

1. 在分支上改 → 本機跑 `npm run build`、`npx tsc --noEmit`、`npm run lint`，並用瀏覽器截圖檢查手機與電腦版。
2. 開 PR → 檢查都通過就合併到 `main`。
3. 合併後看正式網址 <https://pikyoo.vercel.app>。

目前是 Demo 階段，改動合併後直接上正式網址；等有真實使用者後，改成先看分支預覽、確認後再合併。給 AI 助理（Claude Code）的專案規則在 [CLAUDE.md](CLAUDE.md)。
