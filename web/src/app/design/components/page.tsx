import type { Metadata } from "next";
import { Icon } from "@/components/pk/Icon";
import { PkMark } from "@/components/pk/Logo";

export const metadata: Metadata = { title: "基礎元件" };

export default function Page() {
  return (
    <main className="ds narrow">
      <div className="eyebrow">按鈕 Buttons</div>
      <div className="row">
        <button type="button" className="btn btn-primary">報名<Icon name="right" size={18} /></button>
        <button type="button" className="btn btn-secondary">看球局</button>
        <button type="button" className="btn btn-ink">加入候補</button>
        <button type="button" className="btn btn-ghost">清除</button>
        <button type="button" className="btn btn-primary" disabled>送出預約</button>
        <button type="button" className="btn btn-secondary" disabled>已額滿</button>
      </div>
      <div className="row" style={{ marginTop: "var(--space-3)" }}>
        <button type="button" className="btn btn-secondary btn-icon" aria-label="篩選"><Icon name="sliders" size={20} /></button>
        <button type="button" className="btn btn-ghost btn-icon" aria-label="分享"><Icon name="share" size={22} /></button>
        <button type="button" className="btn btn-primary btn-lg"><Icon name="share" size={20} />分享到 LINE 群組</button>
      </div>
      <div className="carbon" style={{ marginTop: "var(--space-3)", padding: "var(--space-4)", borderRadius: "var(--radius-md)" }}>
        <div className="row">
          <button type="button" className="btn btn-primary">選時段預約</button>
          <button type="button" className="btn btn-secondary">取消報名</button>
          <button type="button" className="btn btn-ink">加入候補</button>
        </div>
      </div>
      <p className="note" style={{ marginTop: "var(--space-3)" }}>主按鈕是螢光藥丸＋碳黑硬陰影，按下時往下沉，像擊球的手感；一個畫面只放一個。碳纖維面上自動換成螢光陰影、白色外框。<code>.btn-lg</code> 56px 給底部行動列，<code>.btn-block</code> 滿版。</p>

      <div className="eyebrow">標籤 Tags</div>
      <div className="row">
        <span className="tag tag-accent">你已報名</span>
        <span className="tag tag-outline">拆解動作</span>
        <span className="tag tag-accent-2">3.0</span>
        <span className="tag tag-neutral">LINE Pay</span>
      </div>

      <div className="eyebrow">表單 Forms</div>
      <div className="g2">
        <div className="col">
          <div className="field"><label htmlFor="ds-name">暱稱</label><input className="input" id="ds-name" defaultValue="小安" /></div>
          <div className="field"><label htmlFor="ds-notes">備註</label><textarea className="input" id="ds-notes" rows={3} defaultValue="第一次打，之前打過羽球。" /></div>
        </div>
        <div className="col">
          <div className="field">
            <label id="ds-time">時段</label>
            <div className="seg" role="radiogroup" aria-labelledby="ds-time" style={{ display: "flex" }}>
              <label className="seg-opt"><input type="radio" name="t" defaultChecked />早上</label>
              <label className="seg-opt"><input type="radio" name="t" />下午</label>
              <label className="seg-opt"><input type="radio" name="t" />晚上</label>
            </div>
          </div>
          <div className="field">
            <label id="ds-pay">付款方式</label>
            <div className="col" style={{ gap: "var(--space-1)" }} role="radiogroup" aria-labelledby="ds-pay">
              <label className="radio"><input type="radio" name="pay" defaultChecked /><span className="dot" />LINE Pay</label>
              <label className="radio"><input type="radio" name="pay" /><span className="dot" />銀行轉帳</label>
              <label className="radio"><input type="radio" name="pay" /><span className="dot" />現場付現</label>
            </div>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}><b>只看有空位</b><button type="button" className="switch" role="switch" aria-checked="true" aria-label="只看有空位" /></div>
        </div>
      </div>
      <p className="note" style={{ marginTop: "var(--space-3)" }}>標籤放在欄位上方。輸入框是原生元素加 <code>.input</code>，聚焦時外圈是螢光；分段控制與單選都是原生 radio，鍵盤與選取狀態不需要額外程式。</p>

      <div className="eyebrow">卡片 Cards</div>
      <div className="g3">
        <div className="card"><div className="card-kicker">週日 10/4・10:00</div><div className="card-title">新手體驗課：兩小時上場</div><p className="card-body">含借拍與球，第一次打也 OK。</p><div className="card-meta"><Icon name="pin" size={14} />大安運動中心</div></div>
        <div className="card elev-md"><div className="card-kicker">elev-md</div><div className="card-title">浮起的卡片</div><p className="card-body">卡片、浮層用這一層。</p><div className="card-meta"><Icon name="clock" size={14} />剛剛更新</div></div>
        <div className="card elev-lg"><div className="card-kicker">elev-lg</div><div className="card-title">最上層</div><p className="card-body">Sheet、Dialog、底部導覽。</p><div className="card-meta"><Icon name="users" size={14} />3 位</div></div>
      </div>

      <div className="eyebrow">桌機導覽 Navigation</div>
      <div className="nav-demo">
        <nav className="nav">
          <span className="nav-brand"><PkMark size={26} />PIKYOO</span>
          <a aria-current="page">教練後台</a>
          <a>課程與時段</a>
          <a>收款</a>
          <button type="button" className="btn btn-primary" style={{ minHeight: 40 }}>新增課程</button>
        </nav>
        <div className="page">
          <h1 style={{ marginBottom: "var(--space-3)" }}>早安，Mia</h1>
          <p>桌機版給教練管理用：同一套 token 與元件，換成較寬的版面。</p>
        </div>
      </div>

      <div className="eyebrow">表格 Table</div>
      <table className="table">
        <thead><tr><th>學生</th><th>課程</th><th>狀態</th><th style={{ textAlign: "right" }}>金額</th></tr></thead>
        <tbody>
          <tr><td>葉子</td><td>小班課・10/1</td><td><span className="status status-info">學生已回報</span></td><td className="num" style={{ textAlign: "right" }}>NT$800</td></tr>
          <tr><td>阿何</td><td>小班課・今天</td><td><span className="status status-almost">待付款</span></td><td className="num" style={{ textAlign: "right" }}>NT$800</td></tr>
          <tr><td>Peggy</td><td>一對一 10 堂</td><td><span className="status status-open">已收款</span></td><td className="num" style={{ textAlign: "right" }}>NT$13,500</td></tr>
        </tbody>
      </table>
      <p className="note" style={{ marginTop: "var(--space-3)" }}>表頭 13px 粗體灰字，下方一條碳黑線；數字欄靠右並用 <code>.num</code>。</p>

      <div className="eyebrow">對話框 Dialog</div>
      <div className="dialog-demo">
        <div className="dialog-backdrop">
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="ds-dialog-title">
            <div className="dialog-title" id="ds-dialog-title">取消這次報名？</div>
            <div className="dialog-body">現在離開始還有 3 小時，已超過免責取消時間，取消會記一次晚取消。位子會釋出給候補第 1 位。</div>
            <div className="dialog-actions">
              <button type="button" className="btn btn-secondary">先不要</button>
              <button type="button" className="btn btn-ink">確認取消</button>
            </div>
          </div>
        </div>
      </div>
      <p className="note" style={{ marginTop: "var(--space-3)" }}>手機上優先用底部 Sheet；Dialog 留給需要明確確認的破壞性動作。背景是 50% 碳黑遮罩，面板用 <code>--shadow-lg</code>。</p>
    </main>
  );
}
