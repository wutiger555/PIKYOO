# PIKYOO 匹友 設計系統

雙北匹克球「開團、找課、找場」平台的設計系統。來源：Claude Design 交付（2026-09），依據 `docs/BRAND_DESIGN_BRIEF.md`、`docs/PRD.md`、`docs/PLAN.md`。程式實作在 `web/`，線上規格頁在 `/design`。

概念是「螢光球 × 碳纖維」：匹克球只需要一顆洞洞球和一支拍。螢光黃綠只用在「現在可以行動」的地方，碳纖維面承載品牌（票根、底部行動列、分享圖），其他地方是霧白，留給閱讀。台灣競品用的是 Tailwind 預設的橘、藍、綠、青、紫，這裡全部避開。

## How to use this

- Token 在 `web/src/styles/tokens.css`，元件 class 在 `web/src/styles/pikyoo.css`。顏色、字體、間距、陰影一律用變數（`var(--color-*)`、`var(--font-*)`、`var(--space-*)`、`var(--level-*)`）或對應的 Tailwind 工具類（`bg-accent`、`text-muted`…），不要寫死色碼。
- 用下方的 class 與 `web/src/components/pk/` 的 React 元件組畫面，不要另外發明平行的樣式。
- `/design` 列出每個畫面的用途、功能與對應 PRD 編號，可直接點進可操作的畫面。

## Color

- `--color-bg` 霧白 #F2F3EF：頁面背景。`--color-surface` 白：票卡、卡片。
- `--color-text` 碳黑 #121412：文字、Logo、選中狀態。`--color-muted` 灰碳 #5F645E：次要文字。
- `--color-line` #DFE1DA：細線。
- `--color-accent` 螢光球 #D4EE3A：**只當底色**，上面放碳黑字（`--color-on-accent`）。用在主按鈕、你的座位、今天、缺幾位、選中篩選。螢光面積不超過畫面 8%。
- `--color-carbon` 碳纖維 #1A1D1B ＋ `.carbon`（帶 `--carbon-weave` 斜紋）：票根、Sticky CTA、首頁問候區、LINE／分享卡。深色面上的文字用 `--color-on-carbon` 和 `--color-on-carbon-muted`。
- `--color-accent-2` 橄欖碳：程度色階 `--level-0`…`--level-6`，同一色相由淺到深，徽章上一律顯示數字。
- 功能色 `--color-success/warning/danger/info`（及 `-bg`）只表示狀態，一定搭配文字。

## Type

- 字體堆疊是 `"Barlow", "Noto Sans TC"`：英文與數字用 Barlow，中文落到思源黑體。
- `--font-num`（Barlow Condensed）＋ `.num`：時間、價格、程度、名額，一律用等寬數字。
- 字級（Mobile）：28 / 22 / 18 / 16 內文 / 14 輔助 / 12 僅標籤。中文內文行高 1.6，標題 1.3。

## Icons

- `web/src/components/pk/Icon.tsx`：`<Icon name="ball" size={20} stroke={1.75} />`。圖示從球、拍、球場、哨子延伸出來，實心小圓點代表球孔。
- 功能入口一律用匹克球圖示：ball（探索）、court（球局）、paddlePlus（開團）、whistle（學打球／教練）、player（我的）、clock、cal、pin、sliders、share、bell、cash、compare、medal、trophy、sun、sprout、users。
- 方向、關閉、確認這類通用符號維持大家熟悉的形狀。圖示一律搭配文字。

## Layout

- 8pt 網格：`--space-1` 4 … `--space-12` 48。
- 圓角：`--radius-sm` 6（標籤）、`--radius-md` 10（卡片、票卡、輸入框）、`--radius-lg` 20（Sheet、Dialog）。按鈕、Chips、座位用 `--radius-full`，形狀就是球。
- 點擊區 ≥ 44px（`--tap`），手機主要行動放在底部。

## Signature components（/design/signature）

| Class | 用途 |
| --- | --- |
| `.ticket` + `.ticket-stub/-day/-time/-end` + `.ticket-body/-venue/-where/-tags/-foot/-fee`；`.ticket-lg`、`.is-full` | 球局票卡：左側是碳纖維票根放時間，中間用圓孔打孔線分隔，右側放場地、程度、費用、座位 |
| `.seats` + `.seat-row` + `.seat`（`.host` `.open` `.you` `.wait`）+ `.seats-label`；`.seats-lg` | 座位列，空位是內凹的球孔，一律寫出「缺 N」 |
| `.level` + `.lv` 裡放 7 個 `<i>`（亮起的格子加 `.on`）；`.level-lg` | 程度徽章：高度與深淺表示程度，數字寫出來 |
| `.cred` + `.cred-issuer/-level/-state`；`.cred.self` | 認證徽章：已驗證用實線，自填用虛線 |
| `.sprout` | 新手友善標記（sprout 圖示） |
| `.carbon` | 碳纖維品牌面 |
| `.hl` / `.hl-check` | 螢光筆強調 / AI 低信心欄位 |
| `.status-open/-almost/-full/-ended/-info` | 球局狀態 |
| `.sticky-cta` + `.sticky-cta-info/-price/-sub` | 底部行動列 |
| `.chips` + `.chip[aria-pressed]` | 快速篩選 |
| `.court-rule` | 球場線分隔 |
| `.appbar`、`.tabbar` + `.tab` + `.tab-fab`、`.sheet`、`.toast`、`.switch` | 手機骨架 |
| `.ph` | 圖片／地圖佔位（斜紋＋等寬說明） |
| `.skel` | Skeleton 載入 |

## Component boldness

- 主按鈕：螢光藥丸形，加上碳黑硬陰影（`0 4px 0`），按下時往下沉。一個畫面只放一個。
- 底部導覽：懸浮的碳纖維膠囊，選中的分頁亮螢光。學生端四格「首頁／找教練／我的課／我的」，教練端四格「今天／課程時段／教練頁／收款」；不放中央突起按鈕（2026-09 改為課程為主）。
- 篩選標籤選中時，前面會出現一顆有球孔的小球。
- 區塊標題：粗中文字（900），上方加一行 Barlow Condensed 大寫英文（`.en`），像記分板。
- 字級與點擊區不變：內文 16 以上，點擊區 ≥ 44（按鈕 48、大按鈕 56）。

## Course components（課程為主，2026-09）

| Class / 元件 | 用途 |
| --- | --- |
| `CoachCard`（`.ccard` + `.ccard-photo`） | 找教練列表：16:10 照片在上，下方維持標準化格式（認證、起價、程度、區域、類型、擅長、最近可約、可揪朋友） |
| `CoachMini`（`.cmini`） | 首頁橫向教練卡：4:5 照片、名字、認證、程度、起價 |
| `.cover` + `.chero` | 教練頁：滿版封面照，碳纖維資訊卡疊在下緣 |
| `.gallery` / `.gal` | 教練頁上課照片橫滑 |
| `.pbfile` | 匹克球檔案：球齡、慣用手、打法、運動背景、DUPR、語言 |
| `.avail` | 教練頁未來 7 天可約時段 |
| `.group-cta`、`.group-how`、`.grp-*` | 揪朋友一起上：入口、流程說明、揪團頁（座位、成員、邀請連結） |
| `.lesson` | 我的課列表：碳纖維日期票根＋課程＋狀態 |
| `.qa`、`.qa-*` | 教練頁問與答：「問」墨色方塊、「答」螢光方塊；未回覆顯示「等教練回覆」；提問用底部 Sheet＋常見問題 chip |
| `Img` + `.demo-tag` | 照片：Demo 的圖庫照自動標「示意照」；教練自己上傳的不標；檔案缺失時顯示佔位 |
| `.console-wide`、`.ed-*`、`.pv-frame` | 教練後台編輯器：卡片式表單；桌機 ≥1024px 左表單、右手機框即時預覽 |

## Base components

`.btn`（`.btn-primary` 螢光、`.btn-secondary`、`.btn-ghost`、`.btn-ink` 墨色用於候補、`.btn-icon`、`.btn-lg`、`.btn-block`）、`.tag`、`.field/.input/.radio/.seg`、`.card`、`.row-item`、`.sec-head`、`.nav`（桌機）、`.table`、`.dialog`。

## Brand

- `/design/concept`：概念、用色比例，以及三個圖形語彙：球孔、碳纖維票根、廚房線。
- `/design/logo`：符號是字母 P 做成的球拍，碗是拍面、豎筆是握把，P 中間的洞放一顆螢光球，剛好在甜區。螢光底上的球改成挖空。
- `web/public/logo.svg`、`web/src/components/pk/Logo.tsx`（`PkMark` variant `full`／`small`／`mono`）。

## Do

- 一個畫面只放一個主要螢光按鈕。
- 時間放大，用等寬數字。
- 文案語氣像球友：「週六缺 2，來嗎？」、「報名成功！週六見」。
- 狀態同時用顏色和文字表達。

## Don't

- 不用 Tailwind 預設色，也不用橘、藍、綠、青、紫當主色。
- 不在淺底上用螢光當文字或細線；不用粗線圖示。
- Logo 不旋轉、不描邊、不加孔紋或第二顆球。

## Files

- `web/src/styles/`：tokens、design-system class、各畫面樣式
- `web/src/components/pk/`：Icon、Logo、票卡、座位列、徽章、AppBar、Sheet、TabBar
- `web/src/features/games`：探索 → 球局列表 → 詳情 → 報名 → 成功／候補
- `web/src/features/coaches`：找教練 → 比較 → 教練頁 → 預約 → 付款
- `web/src/features/console`：教練端今天、收款對帳、收款設定、招生頁與分享素材
- `web/src/app/design`：品牌、Logo、Foundations、元件、流程規格頁
