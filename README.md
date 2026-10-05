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
| 2026-10-05 | [#47](https://github.com/wutiger555/PIKYOO/pull/47) | **App 教練後台輸入改好用**：時段用 iPhone 原生時間滾輪、價格有 −／＋、程度直接點階梯選範圍、計價／時長／慣用手／打法用分段按鈕、區域／擅長／適合誰用清單勾選、付款方式用開關；新增 DUPR 欄位 |
| 2026-10-05 | [#46](https://github.com/wutiger555/PIKYOO/pull/46) | **App 教練後台**：「我的 → 我是教練」進入，有今天（確認預約、回覆提問、今日課表）、課程時段（方案、價格、每週時段）、教練頁編輯（照片、介紹、程度、地點、付款方式）、收款對帳。示範模式下學生和教練兩邊連動，一支手機就能演完「預約 → 教練確認 → 付款 → 教練確認收到」 |
| 2026-10-05 | [#45](https://github.com/wutiger555/PIKYOO/pull/45) | **App 首頁與「我的」改成網站版**：訪客看到品牌介紹與註冊，登入後是「嗨，小安，想上什麼課？」、適合你的教練、近期可約、揪朋友；「我的」有出席紀錄、我的球局、通知、設定。全部流程在模擬器實測並留下截圖，修了 6 個問題 |
| 2026-10-05 | [#44](https://github.com/wutiger555/PIKYOO/pull/44) | **App 找球局與找球場**：首頁有找教練／找球局／找球場三個入口；球局列表的快速篩選與篩選面板（日期、區域、時段、程度、只看有空位）和網站一樣，球局詳情可以報名、候補、取消；球場列表與詳情（怎麼預約、開放、收費、這裡的球局）。球局卡片改成網站的票卡樣式 |
| 2026-10-05 | [#43](https://github.com/wutiger555/PIKYOO/pull/43) | **App 上課／找教練與網站對齊**：找教練（程度、類型、已認證、新手友善篩選，標準教練卡，最多比較 3 位）、完整教練頁（跟網站同樣的段落、價目、可約時段、經歷、評價、問與答、訪客登入鎖、底部預約列）、四步驟預約、我的預約進度與付款、我的課。數字改用網站同款字體 |
| 2026-10-05 | [#42](https://github.com/wutiger555/PIKYOO/pull/42) | 修正 App 的自動型別檢查：CI 只安裝 App 的套件時，共用程式找不到 Supabase 套件（#41 合併時漏看這個失敗） |
| 2026-10-05 | [#41](https://github.com/wutiger555/PIKYOO/pull/41) | **App 接真資料**：App 的球局、教練、教練頁改讀正式資料庫（跟網站同一份），下拉可重新整理，讀不到時可以點「再試一次」。我的課與我的頁說明登入即將推出 |
| 2026-10-05 | [#40](https://github.com/wutiger555/PIKYOO/pull/40) | **App 開工（第 16 步）**：`app/` 建好 React Native + Expo App 骨架，iOS 原生分頁列（首頁、找教練、我的課、我的），用跟網站同一份示範資料顯示球局、教練、教練頁，在 iPhone 模擬器上確認。只改 App 或文件時，Vercel 不再重新部署網站 |
| 2026-10-05 | [#39](https://github.com/wutiger555/PIKYOO/pull/39) | **B7 第二部分：管理頁**：「我的 → PIKYOO 管理」最上面看使用者、教練、球局、預約的數字，可以下架／恢復教練頁、下架球局（報名的人會收到通知）。B7 完成 |
| 2026-10-05 | [#38](https://github.com/wutiger555/PIKYOO/pull/38) | **B7 第一部分：SEO**：sitemap、robots、教練／球場／球局頁的結構化資料與 canonical。開放真登入前不讓 Google 收錄（示範網站永遠不收錄）。**App 提前**：B7 完成就開始建 React Native + Expo App，與 B8 同時進行（PLAN D8、APP.md §8） |
| 2026-10-05 | [#37](https://github.com/wutiger555/PIKYOO/pull/37) | **B6 第三部分：前一天提醒**：每天晚上 8 點，明天有課或有球局的人會在站內與 LINE 收到提醒（同一堂課只提醒一次）。B6 通知完成 |
| 2026-10-05 | [#36](https://github.com/wutiger555/PIKYOO/pull/36) | LINE 通知測試訊息（設定檢查用），並讓通知頁的「加 PIKYOO 官方帳號好友」按鈕上線 |
| 2026-10-04 | [#35](https://github.com/wutiger555/PIKYOO/pull/35) | **B6 第二部分：LINE 推播**：預約申請／確認／婉拒、候補遞補、球局變更、付款確認、教練頁審核結果會由官方帳號「PIKYOO 匹友」傳到 LINE（要先加好友，通知頁有按鈕）。逾 48 小時沒回覆的預約現在會自動逾時並通知 |
| 2026-10-04 | [#34](https://github.com/wutiger555/PIKYOO/pull/34) | **B6 第一部分：站內通知**：「我的 → 通知」與桌機右上角鈴鐺看得到預約確認、候補遞補、教練回覆、付款確認等通知與未讀數。**初版不串金流，改成雙方好記帳**：學生回報已付款會通知教練，教練確認收到或按「還沒收到」都會通知學生，「我的課」直接看到待付款／已回報／已付款 |
| 2026-10-04 | [#33](https://github.com/wutiger555/PIKYOO/pull/33) | 文件：新增 [PAYMENTS.md](docs/PAYMENTS.md)，比較藍新、統一金流、綠界、TapPay、LINE Pay、街口、Stripe 的費率、能不能讓錢直接進教練帳戶、教練開通要準備什麼、開發維護成本與口碑。建議主選藍新平台商方案，備選統一金流 PAYUNi |
| 2026-10-04 | [#32](https://github.com/wutiger555/PIKYOO/pull/32) | **B5 第三部分：收款接上資料庫（B5 完成）**：教練在「收款」填 LINE Pay 連結或銀行帳號；確認預約後，學生只看到自己選的付款方式資訊，付好按「我已付款」，教練按「確認收到」。錢直接進教練自己的帳戶 |
| 2026-10-04 | [#31](https://github.com/wutiger555/PIKYOO/pull/31) | **B5 第二部分：問與答接上資料庫**：教練頁的問答改讀資料庫（正式站現在就是）；真登入後學生提問、教練在後台回覆都會存下來，回覆後才公開。留電話、LINE 的內容一樣會被擋 |
| 2026-10-04 | [#30](https://github.com/wutiger555/PIKYOO/pull/30) | **示範網站的日期改成從當天開始**：球局列表是今天、明天和接下來的週末，預約時段是明天起 7 天，教練卡的「最近可約」、教練後台的預約申請也都跟著今天走。之後任何時候向教練展示，都不會看到過去的日期 |
| 2026-10-04 | [#29](https://github.com/wutiger555/PIKYOO/pull/29) | **B5 第一部分：預約上課接上資料庫**：預約頁顯示教練真正開放的時段和剩餘名額（正式站現在就看得到）；真登入後送出的預約會到教練後台「今天」，教練確認或婉拒，學生在「我的課」看到結果、可以取消。超過 48 小時沒回覆會顯示已逾時並釋出名額。示範網站不變 |
| 2026-10-04 | [#28](https://github.com/wutiger555/PIKYOO/pull/28) | 文件：記下三個決定。**初版原則：先求能用、簡單好上手**，複雜的功能等有人用再加；**原生 App 一定會做**，網站上線有真實使用者後開始；**示範網站要保留**，之後向教練展示用。B5 縮小成預約、問與答、收款，「揪朋友一起上」先只在示範網站 |
| 2026-10-04 | [#27](https://github.com/wutiger555/PIKYOO/pull/27) | **B4 第三部分：PIKYOO 審核頁**：管理員在「我的 → PIKYOO 審核」看到待審核的教練頁與證照，可以預覽教練頁、核准公開或退回修改，打開私密的證照檔核對後標記已查驗／未通過，教練都會收到通知。**B4 教練頁與後台完成** |
| 2026-10-04 | [#26](https://github.com/wutiger555/PIKYOO/pull/26) | **B4 第二部分：照片與證照上傳**：教練可以上傳照片（自動縮小，按「儲存」後公開）和證照（照片或 PDF，只有教練本人和 PIKYOO 看得到），證照會顯示審核中／已查驗／未通過。DUPR 分數存成「自填」。教練自己上傳的照片不再被標成「示意照」 |
| 2026-10-04 | [#25](https://github.com/wutiger555/PIKYOO/pull/25) | **B4 第一部分：教練頁接上資料庫**：登入後可以申請成為教練、編輯教練頁與課程方案並儲存、送出審核（真登入啟用後生效）。教練後台上方會顯示頁面狀態（草稿／審核中／已公開）。示範網站不變 |
| 2026-10-04 | [#24](https://github.com/wutiger555/PIKYOO/pull/24) | **B3：球局列表看得到兩週**：原本只有今天、明天、這個週末，現在是今天起 14 天，平日的局也看得到；篩選多了「日期」可以挑某一天，「週末」改成真的看星期幾。開團也能選這 14 天。B3 球局完成 |
| 2026-10-04 | [#23](https://github.com/wutiger555/PIKYOO/pull/23) | **B3：分享球局**：球局連結貼到 LINE 會有預覽圖，顯示時間、場地、程度、費用和「缺幾人」；「選擇群組分享」真的打開 LINE（在 LINE 裡用 Flex 卡片，瀏覽器用 LINE 的分享頁）；「複製連結」改成真的網址。AI 一貼成局先不接 LLM，維持現在的規則解析 |
| 2026-10-04 | [#22](https://github.com/wutiger555/PIKYOO/pull/22) | **B3：團主編輯球局**：球局頁的團主管理多了「編輯資訊」，用開團表單改時間、場地、程度、名額、費用等。改時間、地點或費用時，已報名和候補的人會收到通知；名額加大會自動遞補候補。已取消的局不能改，時間不能改到過去，名額不能少於已報名人數 |
| 2026-10-04 | [#21](https://github.com/wutiger555/PIKYOO/pull/21) | **B3 第二部分：開團與團主管理接上資料庫**：開團會寫進資料庫；團主在球局頁可以幫朋友報名（額滿自動排候補）、移除參加者（候補自動遞補）、取消球局（通知報名的人）。真登入啟用後生效，示範網站也能操作。另外修正：報名失敗時正式站原本看不到中文原因 |
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
