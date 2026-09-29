import type { Metadata } from "next";

export const metadata: Metadata = { title: "圖片" };

export default function Page() {
  return (
    <main className="ds narrow">
      <div className="eyebrow">佔位：斜紋＋等寬說明（.ph）</div>
      <div className="g2">
        <div><div className="ph" style={{ height: 120 }}>地圖縮圖</div><div className="cap">球局詳情的地圖，120px 高、圓角 10。</div></div>
        <div><div className="ph" style={{ height: 120 }}>球場照片 16:9</div><div className="cap">球場列表與詳情（下一輪）。</div></div>
      </div>

      <div className="eyebrow">教練照片（.photo）</div>
      <div className="row">
        <div className="photo lg"><span>M</span><small>照片</small></div>
        <div className="photo"><span>M</span><small>照片</small></div>
        <div className="photo sm"><span>M</span></div>
        <div className="photo xs"><span>M</span></div>
      </div>
      <p className="note" style={{ marginTop: "var(--space-3)" }}>教練還沒上傳照片時，用碳纖維底＋姓名首字。尺寸：教練頁 84×100、列表卡 64×76、比較表 48×56、摘要 40 圓形。</p>

      <div className="eyebrow">規則</div>
      <ul className="note">
        <li>地圖和照片目前都是斜紋佔位，需要真實素材；還沒有素材的地方維持佔位，不放圖庫照片。</li>
        <li>照片跟著容器圓角（卡片 10、教練照 8–12）。真實照片的處理方式等素材到位後再定。</li>
      </ul>
    </main>
  );
}
