import type { Metadata } from "next";

export const metadata: Metadata = { title: "顏色" };

const ROLES = [
  { sw: { background: "var(--color-bg)" }, zh: "霧白", en: "mist", token: "--color-bg #F2F3EF", use: "頁面背景，微冷的灰白" },
  { sw: { background: "var(--color-text)", color: "#fff" }, zh: "碳黑", en: "carbon ink", token: "--color-text #121412", use: "文字、Logo、選中狀態" },
  { sw: { background: "var(--color-accent)" }, zh: "螢光球", en: "optic", token: "--color-accent #D4EE3A", use: "只當底色：主按鈕、你的座位、重點" },
  { sw: {}, carbon: true, zh: "碳纖維", en: "carbon", token: "--color-carbon #1A1D1B", use: "票根、行動列、分享圖（.carbon）" },
  { sw: { background: "var(--color-surface)" }, zh: "白", en: "surface", token: "--color-surface #FFFFFF", use: "票卡、卡片" },
  { sw: { background: "var(--color-muted)", color: "#fff" }, zh: "灰碳", en: "muted", token: "--color-muted #5F645E", use: "次要文字，霧白底 5.4:1" },
];

const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const RAMPS = [["Neutral", "neutral"], ["螢光", "accent"], ["橄欖碳", "accent-2"]];
const LEVELS = [["新手", "<2.0"], ["初階", "2.0"], ["初中階", "2.5"], ["中階", "3.0"], ["中高階", "3.5"], ["進階", "4.0"], ["高階", "4.5+"]];

export default function Page() {
  return (
    <main className="ds narrow">
      <div className="eyebrow">品牌色</div>
      <div className="roles">
        {ROLES.map((r) => (
          <div key={r.en} className="role">
            <div className={`sw${r.carbon ? " carbon" : ""}`} style={r.sw}>{r.zh}</div>
            <div className="meta"><b>{r.en}</b><code>{r.token}</code><br />{r.use}</div>
          </div>
        ))}
      </div>

      <div className="eyebrow">色階 100–900</div>
      {RAMPS.map(([label, key]) => (
        <div key={key} className="ramp">
          <span className="n">{label}</span>
          {STEPS.map((s) => <span key={s} title={`--color-${key}-${s}`} style={{ background: `var(--color-${key}-${s})` }} />)}
        </div>
      ))}

      <div className="eyebrow">程度色階（橄欖碳，由淺到深）</div>
      <div className="levels">
        {LEVELS.map(([zh, n], i) => (
          <div key={n} style={{ background: `var(--level-${i})`, color: i >= 4 ? "var(--color-bg)" : undefined }}><small>{zh}</small>{n}</div>
        ))}
      </div>

      <div className="eyebrow">功能色（只表示狀態，一律搭配文字）</div>
      <div className="func">
        <div style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}>✓ 報名成功</div>
        <div style={{ background: "var(--color-warning-bg)", color: "var(--color-warning)" }}>! 快額滿／候補</div>
        <div style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}>× 已取消</div>
        <div style={{ background: "var(--color-info-bg)", color: "var(--color-info)" }}>i 提示</div>
      </div>

      <div className="eyebrow">規則</div>
      <ul className="note">
        <li>螢光只當底色，上面一律放碳黑字（15:1）。不在淺底上用螢光當文字或細線。</li>
        <li>碳纖維面上的文字用白（主要）與 #B9BEB6（次要），螢光在深底上可當重點色塊。</li>
        <li>一個畫面只有一個主要螢光按鈕；螢光面積不超過畫面 8%。</li>
        <li>橄欖碳只用在程度色階，不當品牌色；成功狀態用獨立的綠色並搭配文字。</li>
        <li>Tailwind 工具類直接對應這些 token：<code>bg-accent</code>、<code>text-muted</code>、<code>border-line</code>、<code>bg-level-3</code>…</li>
      </ul>
    </main>
  );
}
