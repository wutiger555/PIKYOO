import type { Metadata } from "next";

export const metadata: Metadata = { title: "字體" };

export default function Page() {
  return (
    <main className="ds narrow">
      <div className="eyebrow">字級（Mobile）</div>
      <div className="trow"><span className="tl-lbl">大標 28/1.3</span><h1>想打球，來匹友就對了。</h1></div>
      <div className="trow"><span className="tl-lbl">標題 22/1.3</span><h2>今天可以打</h2></div>
      <div className="trow"><span className="tl-lbl">小標 18/1.3</span><h3>大安運動中心</h3></div>
      <div className="trow"><span className="tl-lbl">內文 16/1.6</span><p>團主阿凱開的局，程度 2.5–3.0，現場付現。開始前 12 小時可以免責取消，之後取消會記一次晚取消。</p></div>
      <div className="trow"><span className="tl-lbl">輔助 14</span><p style={{ fontSize: 14 }} className="text-muted">大安區辛亥路三段 55 號・室內 4 面</p></div>
      <div className="trow"><span className="tl-lbl">標籤 12</span><p style={{ fontSize: 12, fontWeight: 700 }} className="text-muted">僅用於標籤與圖說</p></div>

      <div className="eyebrow">區塊標題：記分板</div>
      <div className="sec-head" style={{ maxWidth: 390 }}>
        <h2><span className="en">Play today</span>今天可以打</h2>
      </div>
      <p className="note">粗中文字（900）上方加一行 Barlow Condensed 大寫英文（<code>.en</code>）。</p>

      <div className="eyebrow">時間是主角：Barlow Condensed＋等寬數字</div>
      <div className="nums">
        <div><span className="num" style={{ fontSize: 40, fontWeight: 600, lineHeight: 1 }}>19:00</span><small>詳情票卡 40</small></div>
        <div><span className="num" style={{ fontSize: 30, fontWeight: 600, lineHeight: 1 }}>07:30</span><small>列表票卡 30</small></div>
        <div><span className="num" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1 }}>NT$1,200</span><small>價格 24</small></div>
        <div><span className="num" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1 }}>3.0–3.5</span><small>程度 15–18</small></div>
      </div>

      <div className="eyebrow">規則</div>
      <ul className="note">
        <li>字體堆疊 <code>&quot;Barlow&quot;, &quot;Noto Sans TC&quot;</code>：英文與數字自動用 Barlow，中文落到思源黑體（next/font 自動載入）。</li>
        <li>時間、價格、程度、名額一律用 <code>.num</code>（Barlow Condensed、tabular-nums），列表上下對齊。</li>
        <li>標題 700、內文 400、強調 500。中文不加字距、不用斜體。</li>
        <li>內文最小 16px；12px 只給標籤。支援系統字級放大，容器不寫死高度。</li>
      </ul>
    </main>
  );
}
