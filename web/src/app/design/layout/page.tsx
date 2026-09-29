import type { Metadata } from "next";

export const metadata: Metadata = { title: "間距" };

const SPACES = [["--space-1", 4], ["--space-2", 8], ["--space-3", 12], ["--space-4", 16], ["--space-6", 24], ["--space-8", 32], ["--space-10", 40], ["--space-12", 48]] as const;
const RADII = [["--radius-sm", "6 標籤"], ["--radius-md", "10 卡片、票卡、輸入框"], ["--radius-lg", "20 Sheet、Dialog"], ["--radius-full", "按鈕、Chips、座位"]] as const;

export default function Page() {
  return (
    <main className="ds narrow">
      <div className="eyebrow">間距：8pt 網格</div>
      {SPACES.map(([t, px]) => (
        <div key={t} className="sprow"><span className="tlabel">{t}</span><div className="spbar" style={{ width: `var(${t})` }} /><span className="num text-muted" style={{ fontSize: 14 }}>{px}</span></div>
      ))}

      <div className="eyebrow">圓角：按鈕的形狀就是球</div>
      <div className="radii">
        {RADII.map(([t, note]) => (
          <div key={t}><div className="rbox" style={{ borderRadius: `var(${t})` }} /><div className="cap"><code>{t}</code><br />{note}</div></div>
        ))}
      </div>

      <div className="eyebrow">陰影</div>
      <div className="g3">
        <div className="ebox elev-sm">sm：列表、輸入框</div>
        <div className="ebox elev-md">md：卡片、浮層</div>
        <div className="ebox elev-lg">lg：Sheet、Dialog、底部導覽</div>
      </div>

      <div className="eyebrow">球場線分隔 .court-rule</div>
      <div className="court-rule" />

      <div className="eyebrow">規則</div>
      <ul className="note">
        <li>點擊區 ≥ 44px（<code>--tap</code>）；按鈕 48、大按鈕 56。手機主要行動放在底部（Sticky CTA、底部導覽）。</li>
        <li>區塊之間用間距分開；需要分隔時用 1px <code>--color-line</code> 細線或廚房線 <code>.court-rule</code>。</li>
        <li>手機寬度 360–767 為主；桌機把 App 放在 480px 置中欄，教練後台之後做桌機版。</li>
      </ul>
    </main>
  );
}
