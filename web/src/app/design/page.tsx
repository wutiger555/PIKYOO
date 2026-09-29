import Link from "next/link";
import { PkMark } from "@/components/pk/Logo";
import { FLOWS } from "@/lib/data/flows";
import { DESIGN_PAGES } from "./pages";

const PAGE_NOTES: Record<string, string> = {
  "/design/concept": "螢光球 × 碳纖維：用色比例、三個圖形語彙",
  "/design/logo": "P＝球拍，甜區上的洞＝球",
  "/design/color": "品牌色、色階、程度色階、功能色",
  "/design/type": "Barlow＋Noto Sans TC，時間用等寬數字",
  "/design/layout": "8pt 網格、圓角、陰影、點擊區",
  "/design/icons": "從球、拍、球場、哨子延伸的圖示",
  "/design/image": "照片與地圖的佔位與規則",
  "/design/signature": "票卡、座位列、程度與認證徽章、Sticky CTA",
  "/design/components": "按鈕、表單、卡片、導覽、表格、對話框",
};

export default function Page() {
  return (
    <main className="ds">
      <div className="intro carbon">
        <PkMark size={56} style={{ color: "#fff" }} />
        <h1 style={{ marginTop: "var(--space-4)" }}>PIKYOO 匹友 設計系統</h1>
        <p>雙北匹克球「開團、找課、找場」平台。主軸是「教練來找學生、學生來找課」。這裡是團隊對齊用的規格，也是每個畫面的入口：點「看畫面」直接進可操作的 MVP。</p>
      </div>

      <div className="eyebrow">設計系統</div>
      <div className="tiles">
        {DESIGN_PAGES.slice(1).map((p) => (
          <Link key={p.href} href={p.href} className="card tile">
            <div className="card-title">{p.label}</div>
            <p className="card-body">{PAGE_NOTES[p.href]}</p>
          </Link>
        ))}
      </div>

      {FLOWS.map((f) => (
        <div key={f.key}>
          <div className="eyebrow">{f.title}</div>
          <p className="note">{f.sub}</p>
          <div className="flow">
            {f.steps.map((s, i) => (
              <div key={s.title} className="flow-step">
                <span className="n">{i + 1}</span>
                <div>
                  <h4>{s.title}</h4>
                  {s.why && <p>{s.why}</p>}
                  {s.features && (
                    <ul>{s.features.map((x) => <li key={x}>{x}</li>)}</ul>
                  )}
                  {s.prd && <div className="prd">{s.prd.map((x) => <span key={x}>{x}</span>)}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <Link className="btn btn-secondary" href={s.href}>看畫面</Link>
                  {s.hint && <small className="text-muted" style={{ fontSize: 12 }}>{s.hint}</small>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="eyebrow">尚未設計（下一輪）</div>
      <ul className="note">
        <li>開團／AI 一貼成局、LINE 聊天室裡的球局 Flex 卡片</li>
        <li>新手專區、程度自評、球場列表／地圖、我的</li>
        <li>空白、載入、錯誤狀態（目前只有篩選結果為零的空狀態）與深色模式</li>
        <li>桌機版教練後台；地圖與照片目前是斜紋佔位，需要真實素材</li>
      </ul>
    </main>
  );
}
