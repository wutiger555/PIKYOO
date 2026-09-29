# Demo 照片清單

教練頁、教練卡、揪團頁、球場詳情會讀 `web/public/photos/` 裡的這些檔案。檔案不存在時，畫面會顯示「照片」佔位，不會壞掉。

照片來自 [Unsplash](https://unsplash.com)，全部是 **Unsplash License**（免費、可商用、可修改、不需署名；這裡仍列出攝影師以示感謝）。照片裡的人**不是** Demo 裡的教練，所以 `Img` 元件會在每張照片上自動加「示意照」標籤（教練在後台自己上傳的照片不加）。正式上線前一定要換成教練本人授權的真實照片（品牌簡報 §8.4：真實的台灣球場與球友）。挑圖時以亞洲球員、室內運動中心的場景為主，比較接近台灣的樣子。

檔案都是從 `images.unsplash.com` 以固定比例裁切下載（封面 960×1200、相簿 1200×900、球場 1200×675）。

## 教練

| 檔名 | 用在 | Unsplash 原圖 | 攝影師 |
|---|---|---|---|
| `mia-cover.jpg` | Mia 封面、卡片 | [7URGP_VmQW0](https://unsplash.com/photos/7URGP_VmQW0) | Wind Tan |
| `mia-lesson.jpg` | Mia 相簿 | [2-xFXSEVzHM](https://unsplash.com/photos/2-xFXSEVzHM) | Wind Tan |
| `mia-group.jpg` | Mia 相簿、揪團頁 | [hsBhec8r74o](https://unsplash.com/photos/hsBhec8r74o) | Wind Tan |
| `zhao-cover.jpg` | 趙教練封面 | [hsI0W8xks4o](https://unsplash.com/photos/hsI0W8xks4o) | Bhong Bahala |
| `zhao-lesson.jpg` | 趙教練相簿 | [K_Hnb8nN544](https://unsplash.com/photos/K_Hnb8nN544) | Bhong Bahala |
| `zhao-match.jpg` | 趙教練相簿 | [XRdA6Wqhlr0](https://unsplash.com/photos/XRdA6Wqhlr0) | Hoi Pham |
| `ann-cover.jpg` | 安妮封面 | [G1wsLgui0wM](https://unsplash.com/photos/G1wsLgui0wM) | Bhong Bahala |
| `ann-group.jpg` | 安妮相簿 | [UHZ_w1bOIvY](https://unsplash.com/photos/UHZ_w1bOIvY) | Lesli Whitecotton |
| `ann-gear.jpg` | 安妮相簿 | [KO6QJcddk28](https://unsplash.com/photos/KO6QJcddk28) | Alex Saks |
| `ray-cover.jpg` | Ray 封面（左右翻轉成左手持拍） | [jpfiy8DahUc](https://unsplash.com/photos/jpfiy8DahUc) | Bhong Bahala |
| `ray-match.jpg` | Ray 相簿 | [FOXuiVa2KvI](https://unsplash.com/photos/FOXuiVa2KvI) | Hoi Pham |

## 球場

| 檔名 | 球場 | Unsplash 原圖 | 攝影師 |
|---|---|---|---|
| `court-daan.jpg` | 大安運動中心 | [AILEpOyczIk](https://unsplash.com/photos/AILEpOyczIk) | Palak Pitroda |
| `court-xinyi.jpg` | 信義運動中心 | [EZ3WGTmYCxQ](https://unsplash.com/photos/EZ3WGTmYCxQ) | Wind Tan |
| `court-zhongshan.jpg` | 中山運動中心 | [e8wsKQzBmNo](https://unsplash.com/photos/e8wsKQzBmNo) | Bhong Bahala |
| `court-neihu.jpg` | 內湖運動中心 | [wRwBin5-XyY](https://unsplash.com/photos/wRwBin5-XyY) | Bhong Bahala |
| `court-dajia.jpg` | 大佳河濱公園 | [cNuo2I6bznQ](https://unsplash.com/photos/cNuo2I6bznQ) | Brian Zajac |
| `court-banqiao.jpg` | 板橋第一運動場風雨球場 | [YIIvX8SIr-U](https://unsplash.com/photos/YIIvX8SIr-U) | Brian Zajac |

球場照片不是該球場本身，只是同類型場地的示意；球局詳情與球場詳情的地圖縮圖仍是斜紋佔位。
