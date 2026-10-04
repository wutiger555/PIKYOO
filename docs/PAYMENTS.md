# PIKYOO 金流評估：台灣支付服務商比較

> 調查日期：2026-10-04（Claude 研究，資料以官網與官方程式碼為主）。標「待確認」的項目官網沒有公開，要洽業務。
> 相關文件：`PLAN.md` §12（金流策略：平台金流「不過水」）、`BUSINESS_MODEL.md`（平台費與成本）、`BACKEND.md` §13（目前進度）。

---

## 0. 結論

| 項目 | 建議 |
|---|---|
| **現在（初版，`PLAN.md` D9）** | **不串金流**。教練自己收款（LINE Pay 連結、轉帳、現場付現），PIKYOO 顯示付款資訊、讓雙方確認：學生回報已付款 → 教練確認收到或按「還沒收到」退回，每一步都通知對方（B5 第三部分、B6 第一部分） |
| **之後的主選** | **藍新 NewebPay「合作推廣商（平台商）」方案**：唯一能從公開 API 確認「平台幫教練開子商店＋自動代扣平台費」整條路都通的；錢直接進教練帳戶（不過水）；免開辦費、免年費 |
| **備選** | **統一金流 PAYUNi 平台／代理商方案**：撥款較快（T+7）、超商代碼較便宜；Yahoo 拍賣 2026-04 起改用它，個人賣家平台可行。平台合約細節沒公開 |
| **做法** | 同時向藍新、PAYUNi 詢價，**拿到平台費代扣機制、教練審核天數、費用的書面說明**再決定 |
| **一定要先做** | 公司登記（平台商方案要統編）；平台條款寫清楚 PIKYOO 不代收款 |

**為什麼一定要「不過水」**：數位發展部 2024-11-29 發布第三方支付洗錢防制登錄辦法。只要錢先進 PIKYOO 帳戶再轉給教練，就可能被認定是第三方支付業者，要登錄、準備內控、信託或履約保證。讓錢直接進教練帳戶、PIKYOO 只代扣平台費，就能避開這整套負擔。

---

## 1. 比較總表

| | **藍新 NewebPay** | **統一金流 PAYUNi** | **綠界 ECPay** | **TapPay** | **LINE Pay 直接簽** | **街口 直接簽** |
|---|---|---|---|---|---|---|
| 國內信用卡 | 2.8%（含稅） | 2.8% | 一般 2.75%（未稅）＋每筆 1 元；特約 1.85–2.75% | 2.75%（未稅） | 3%（未稅） | 線上 2.5% |
| Apple／Google Pay | 2.8% | 待確認 | Apple Pay 2.75%；Google Pay 未列 | 含在 2.75%；Apple Pay 網頁版月費 200 元 | — | — |
| ATM 虛擬帳號 | 1%，每筆 10–20 元 | 1% | 1%，最低 15 元 | 1%，最低 15 元 | — | — |
| 超商代碼 | 28 元 | 25 元 | 31 元 | 未列 | — | — |
| 開辦費／年費 | 免 | 免 | 一般免；特約開辦 5,000＋年費 13,000 起 | **開辦 5,000＋年費 11,000** | 免 | 免 |
| 撥款 | 信用卡 T+10、ATM T+7 | T+7 | 10 日內 | 依合約 | 約 2 工作天 | 待確認 |
| **平台不過水分帳** | **有**（Partner API：建立教練子商店、代扣平台費） | **有**（平台／代理商參數、合作商店、分潤報表） | 只有專案合作，沒有公開 API | 有分帳，但對象定位為「供應商」 | 沒有 | 沒有 |
| 教練開戶 | 個人可開：身分證、健保卡、本人帳戶 | 個人可開：身分證＋第二證件、本人帳戶 | 個人可開 | 偏公司戶，上線 2–4 週 | — | — |
| 開發工作 | 中：AES 加密＋導頁，約 1–2 週 | 中：AES 加密，官方只有 PHP/.NET SDK | 中偏高：CheckMacValue | 最現代：token＋原生 SDK；RN 需離開 Expo Go | — | — |
| 口碑 | 老牌；負評多為帳戶凍結 | 較新，統一集團背書，已接 Yahoo 拍賣 | 市佔最大；2021 曾遭 DDoS（舊） | 工程師口碑好；年費門檻高 | — | — |

**不建議當主力**：綠界（平台方案只有專案合作，用一般帳戶收再轉等於自己代收轉付）、TapPay（第一年 16,000 元起，規模大了再評估，App 內原生刷卡體驗最好）、LINE Pay／街口直接簽（沒有平台子商戶；要收 LINE Pay 改透過藍新或 PAYUNi 開通）、**Stripe（不支援台灣公司）**。

---

## 2. 要準備的事

1. **公司登記**：有限公司、公司銀行帳戶、負責人證件。
2. **電子發票**：PIKYOO 收的平台費要開發票。藍新有 ezPay 發票；綠界發票新戶首年免費；PAYUNi 待確認。
3. **教練的稅務提醒**：個人透過網路平台銷售達一定金額要辦稅籍與商業登記（財政部，2023-01-01 起），條款提醒教練自行負責。
4. **平台條款**：PIKYOO 不代收款、退款與爭議流程、平台費比例、取消時平台費退不退。
5. **產品**：教練後台加「開通收款」精靈（透過金流商 API 建子商店），開通狀態回寫資料庫；開通前教練照現在的方式自己收款。
6. **技術**：網頁用金流商付款頁導頁（最省維護）；App 先用 WebView／外部瀏覽器開付款頁，需要原生刷卡再評估 TapPay。

## 3. 風險

- **平台方案細節不公開**：代扣機制、合約最低量、教練審核天數，簽約前要書面說明。
- **教練開戶流失**：每位教練要上傳證件、等審核。保留「自己收款」當過渡，降低門檻。
- **帳戶凍結與撥款延遲**：台灣金流最常見的抱怨，客訴會先到 PIKYOO。
- **撥款慢**：信用卡 T+7 到 T+10，比轉帳、現金慢，要先跟教練講清楚。

## 4. 待洽業務確認

藍新與 PAYUNi 平台方案的費用與合約條件、平台費代扣怎麼運作、教練審核天數；PAYUNi 的 Apple／Google Pay 費率與發票服務；TapPay 撥款天數、個人供應商資格；街口撥款天數。PTT、Dcard 上 2025–2026 年針對這幾家的評價很少，口碑判斷的資料偏薄。

## 5. 來源

**官方**：[藍新費率](https://www.newebpay.com/website/Page/content/service_fare)、[藍新 API 文件](https://www.newebpay.com/website/Page/content/download_api)、[藍新 Partner API 社群 SDK](https://github.com/depresto/newebpay-mpg-sdk)、[PAYUNi 費用](https://www.payuni.com.tw/fee)、[PAYUNi PHP SDK](https://github.com/payuni/PHP_SDK)、[Yahoo 拍賣改用 PAYUNi](https://tw.help.yahoo.com/kb/SLN37266.html)、[綠界費用](https://www.ecpay.com.tw/Business/payment_fees)、[綠界 PlatformID](https://developers.ecpay.com.tw/2864/)、[TapPay 費率](https://www.tappaysdk.com/taiwan-zhtw/help/pricing)、[TapPay 導入流程](https://www.tappaysdk.com/taiwan-zhtw/help/onboarding)、[TapPay 分帳](https://www.tappaysdk.com/taiwan-zhtw/service/payments)、[街口店家費率](https://www.jkopay.com/application/store)、[LINE Pay 合作商店](https://web-tw-pay.line.me/cms/event/display/bf73ade9-6e0f-4f5c-8422-1f133ef78f61)、[Stripe 支援國家](https://stripe.com/global)、[第三方支付洗錢防制登錄辦法](https://law.moda.gov.tw/LawContent.aspx?id=GL000160)

**次要與口碑**：[PAYUNi 評測](https://site-now.app/payuni-review/)、[藍新評測](https://site-now.app/newebpay-review/)、[netiCRM 比較](https://neticrm.tw/resources/255)、[金流費率比較](https://ke2b.com/zh-hant/charge-rates-payment-gateways-comparison-taiwan/)、[綠界 DDoS 事件（2021）](https://www.ithome.com.tw/news/145796)、[TapPay RN 經驗](https://blackbing.medium.com/%E9%96%8B%E6%BA%90%E5%B0%88%E6%A1%88-react-native-tappay-7a29ace85e0b)、[Dcard 藍新討論](https://www.dcard.tw/topics/%E8%97%8D%E6%96%B0%E9%87%91%E6%B5%81)
