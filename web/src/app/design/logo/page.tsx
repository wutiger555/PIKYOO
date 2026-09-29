import type { Metadata } from "next";
import { PkBall, PkMark } from "@/components/pk/Logo";

export const metadata: Metadata = { title: "Logo" };

function Lockup({ mark, size = 46 }: { mark: React.ReactNode; size?: number }) {
  return (
    <div className="lock-h">
      {mark}
      <div>
        <div className="wm" style={{ fontSize: size }}>PIKYOO</div>
        <div className="zh" style={{ fontSize: 20, marginTop: 6 }}>匹友</div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="ds">
      <div className="hero-grid">
        <div className="construct">
          <PkMark size="62%" />
          <span className="ann" style={{ top: "17%", right: "4%" }}>拍面</span>
          <span className="ann" style={{ top: "39%", right: "4%" }}>仿真匹克球</span>
          <span className="ann" style={{ bottom: "12%", right: "22%" }}>握把</span>
        </div>
        <div className="story">
          <div className="eyebrow" style={{ margin: 0 }}>定稿符號</div>
          <h1>P 是一支球拍，<br />洞是一顆球。</h1>
          <p>字母 P 的碗做成匹克球拍的拍面，豎筆是握把；P 中間本來就有的洞，放上一顆螢光球，剛好落在甜區。球照真的戶外球畫：中心一孔、內圈六孔、外圈的孔順著球面收窄，左上受光。</p>
          <ol>
            <li>拍＋球＝匹克球，不用球拍交叉、不用寫實球。</li>
            <li>P 是 PIKYOO 的第一個字，也是 Pickleball 的 P。</li>
            <li>32px 以上用球孔版；24px 以下換無孔版，小尺寸仍然清楚。</li>
          </ol>
        </div>
      </div>

      <div className="eyebrow">組合</div>
      <div className="g2">
        <div>
          <div className="plate"><Lockup mark={<PkMark size={60} />} /></div>
          <div className="cap">橫式：網站頂部、分享圖浮水印。</div>
        </div>
        <div>
          <div className="plate">
            <div className="lock-v">
              <PkMark size={72} />
              <div className="wm" style={{ fontSize: 38 }}>PIKYOO</div>
              <div className="zh" style={{ fontSize: 18, marginTop: -2 }}>匹友</div>
            </div>
          </div>
          <div className="cap">直式：Onboarding、LINE 圖文選單、OG 圖。</div>
        </div>
        <div>
          <div className="plate carbon"><Lockup mark={<PkMark size={60} style={{ color: "#fff" }} />} /></div>
          <div className="cap">碳纖維底：拍面改白，球保持螢光。LINE 卡片、分享圖。</div>
        </div>
        <div>
          <div className="plate optic"><Lockup mark={<PkMark size={60} variant="mono" style={{ color: "var(--color-text)" }} />} /></div>
          <div className="cap">螢光底：球變成真的洞，透出底色。主視覺、活動物料。</div>
        </div>
      </div>

      <div className="eyebrow">字標細節</div>
      <div className="plate" style={{ minHeight: 160 }}>
        <div className="wm" style={{ fontSize: 88 }}>PIKYO<PkBall className="o" /></div>
      </div>
      <div className="cap">大尺寸（40px 以上）時最後一個 O 可換成球，呼應符號；小尺寸一律用純文字字標。</div>

      <div className="eyebrow">小尺寸與裁切</div>
      <div className="sizes">
        <div><PkMark size={16} variant="small" />16 無孔版</div>
        <div><PkMark size={24} variant="small" />24 無孔版</div>
        <div><PkMark size={32} />32</div>
        <div><div className="app" style={{ width: 96, height: 96, background: "var(--color-accent)" }}><PkMark size={64} variant="mono" style={{ color: "var(--color-text)" }} /></div>App／PWA（主）</div>
        <div><div className="app carbon" style={{ width: 96, height: 96 }}><PkMark size={64} style={{ color: "#fff" }} /></div>App（深色）</div>
        <div><div className="app" style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--color-accent)" }}><PkMark size={58} variant="mono" style={{ color: "var(--color-text)" }} /></div>LINE 大頭貼</div>
        <div><div className="app" style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--color-surface)", border: "1px solid var(--color-line)" }}><PkMark size={58} variant="mono" style={{ color: "var(--color-text)" }} /></div>單色</div>
      </div>

      <div className="eyebrow">使用規則</div>
      <div className="rules">
        <div><b>留白</b>四周至少留一顆球的直徑。</div>
        <div><b>顏色</b>只用碳黑、白、螢光三色。球永遠是螢光或挖空，不改成其他顏色。</div>
        <div><b>不要</b>旋轉、加陰影、描邊、把拍面改方、改變球孔排列或加第二顆球。</div>
      </div>
    </main>
  );
}
