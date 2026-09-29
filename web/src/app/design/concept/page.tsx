import type { Metadata } from "next";
import { CourtArt } from "@/components/pk/Badges";
import { PkMark } from "@/components/pk/Logo";

export const metadata: Metadata = { title: "品牌概念" };

export default function Page() {
  return (
    <main className="ds">
      <div className="lead carbon">
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", color: "var(--color-accent)" }}>PIKYOO 視覺概念</div>
          <h1>螢光球，碳纖維拍。</h1>
          <p>匹克球只需要兩樣東西：一顆洞洞球、一支拍。介面也只用這兩種材質——螢光標出「現在可以行動」，碳纖維承載品牌，其餘留給閱讀。</p>
        </div>
        <PkMark size={120} style={{ color: "#fff" }} />
      </div>

      <div className="eyebrow">用色比例（每個畫面）</div>
      <div className="ratio">
        <div style={{ flex: 70, background: "var(--color-bg)" }}>霧白＋白 ~70%　閱讀</div>
        <div className="carbon" style={{ flex: 22 }}>碳纖維 ~22%　品牌</div>
        <div style={{ flex: 8, background: "var(--color-accent)" }}>螢光 ≤8%</div>
      </div>
      <dl className="use" style={{ marginTop: "var(--space-4)" }}>
        <dt>螢光球</dt><dd>只給「會動的東西」：主按鈕、你的座位、今天、缺幾位、選中的篩選點。一個畫面只有一個主要螢光按鈕。</dd>
        <dt>碳纖維</dt><dd>票卡的票根、底部行動列、首頁問候區、LINE 卡片與分享圖。帶極細的斜紋編織，靠近看才看得到。</dd>
        <dt>霧白／白</dt><dd>列表、詳情、表單。資訊密度最高的地方維持最安靜。</dd>
      </dl>

      <div className="eyebrow">三個圖形語彙</div>
      <div className="three">
        <div className="pill">
          <div className="art" style={{ background: "var(--color-bg)" }}>
            <div className="holes"><i className="f" /><i className="f" /><i className="f" /><i className="y" /><i /><i /></div>
          </div>
          <h3>球孔</h3>
          <p>空位就是一個還沒被填的球孔（內凹陰影），報名後填滿。票卡的打孔線也用同樣的圓孔。</p>
        </div>
        <div className="pill">
          <div className="art carbon"><div style={{ fontFamily: "var(--font-num)", fontWeight: 600, fontSize: 44, lineHeight: 1 }}>19:00</div></div>
          <h3>碳纖維票根</h3>
          <p>每張球局票卡左側都是碳纖維票根，大字時間。截圖一眼就知道是匹友。</p>
        </div>
        <div className="pill">
          <div className="art" style={{ background: "var(--color-bg)" }}><CourtArt /></div>
          <h3>廚房線</h3>
          <p>非截擊區的線條比例用在分隔線、空狀態插圖與新手專區，取代通用幾何裝飾。</p>
        </div>
      </div>
    </main>
  );
}
