import type { Metadata } from "next";
import { Cred, LevelChip, Sprout, Status } from "@/components/pk/Badges";
import { GameTicket } from "@/components/pk/Ticket";
import { getGame } from "@pikyoo/core/data/games";
import type { Level } from "@pikyoo/core/types";

export const metadata: Metadata = { title: "招牌元件" };

function SeatRow({ taken, you, open, wait, label }: { taken: string[]; you?: boolean; open: number; wait?: number; label?: string }) {
  return (
    <div className="seats seats-lg">
      <div className="seat-row">
        {taken.map((t, i) => <span key={i} className={`seat${i === 0 ? " host" : ""}`}>{t}</span>)}
        {you && <span className="seat you">你</span>}
        {Array.from({ length: open }, (_, i) => <span key={"o" + i} className="seat open" />)}
        {!!wait && <span className="seat wait">候補 {wait}</span>}
      </div>
      {label && <span className="seats-label">{label}</span>}
    </div>
  );
}

export default function Page() {
  const tickets = ["g1", "g4", "g3", "g5"].map((id) => getGame(id)!);
  return (
    <main className="ds" style={{ maxWidth: 860 }}>
      <div className="eyebrow">球局票卡 Game Ticket</div>
      <p className="note">左側票根放時間（Barlow Condensed、等寬數字），打孔線分隔右側場地、程度與費用；底部是座位列。列表、LINE Flex 卡片、分享圖都用同一個結構。元件：<code>{`<GameTicket game={g} />`}</code></p>
      <div className="g2">{tickets.map((g) => <GameTicket key={g.id} game={g} />)}</div>

      <div className="eyebrow">座位列 Seat Row</div>
      <p className="note">已報名＝頭像（團主有外圈）、空位＝內凹的球孔、你＝螢光實心、候補＝數字。旁邊一律寫出「缺 N」，不只靠圖示。</p>
      <div className="col">
        <div className="row"><span className="lbl">招募中</span><SeatRow taken={["凱", "林", "安", "M"]} open={2} label="缺 2" /></div>
        <div className="row"><span className="lbl">剛報名</span><SeatRow taken={["凱", "林", "安", "M"]} you open={1} label="缺 1" /></div>
        <div className="row"><span className="lbl">額滿＋候補</span><SeatRow taken={["凱", "林", "安", "M", "吳", "陳"]} open={0} wait={2} label="額滿" /></div>
      </div>

      <div className="eyebrow">程度徽章 Level Chip</div>
      <p className="note">7 格階梯：高度與橄欖碳深淺同時表示程度，色盲也看得懂；數字永遠寫出來。範圍局亮起多格。</p>
      <div className="row">{([0, 1, 2, 3, 4, 5, 6] as Level[]).map((l) => <LevelChip key={l} min={l} />)}</div>
      <div className="row" style={{ marginTop: "var(--space-3)" }}>
        <LevelChip min={3} max={4} lg />
        <LevelChip min={0} max={2} lg />
      </div>

      <div className="eyebrow">認證徽章 Credential Badge</div>
      <p className="note">發證單位＋等級。已驗證＝實線＋碳黑發證欄；自填＝虛線＋灰色，並寫出「自填」。</p>
      <div className="row">
        <Cred c={{ issuer: "總會", level: "丙級教練", verified: true }} />
        <Cred c={{ issuer: "協會", level: "認證教練", verified: true }} />
        <Cred c={{ issuer: "PPR", level: "Certified", verified: true }} />
        <Cred c={{ issuer: "DUPR", level: "3.85", verified: false }} />
      </div>

      <div className="eyebrow">標記與強調</div>
      <div className="col">
        <div className="row"><span className="lbl">新手友善</span><Sprout /></div>
        <div className="row"><span className="lbl">狀態</span><Status tone="open">招募中</Status><Status tone="almost">快額滿</Status><Status tone="full">額滿可候補</Status><Status tone="ended">已結束</Status><Status tone="full" style={{ background: "var(--color-neutral-100)" }}>已取消</Status></div>
        <div className="row"><span className="lbl">螢光筆</span><span style={{ fontSize: 22, fontWeight: 700 }}>週六<span className="hl">缺 2</span>，來嗎？</span></div>
        <div className="row"><span className="lbl">需要確認</span><span style={{ fontSize: 16 }}>場地：<span className="hl-check">大安運動中心？</span>（AI 低信心欄位）</span></div>
        <div className="row"><span className="lbl">球場線</span><div className="court-rule" style={{ flex: 1, margin: 0 }} /></div>
      </div>

      <div className="eyebrow">快速篩選 Chips</div>
      <div className="chips">
        {["今天", "明天", "週末", "晚上", "新手友善", "有空位"].map((c, i) => <button key={c} className="chip" aria-pressed={i === 0}>{c}</button>)}
      </div>

      <div className="eyebrow">底部行動列 Sticky CTA</div>
      <div className="col">
        <div className="phonebar"><div className="sticky-cta"><div className="sticky-cta-info"><span className="sticky-cta-price">NT$150</span><span className="sticky-cta-sub">還有 2 個位子</span></div><button className="btn btn-primary btn-lg">報名</button></div></div>
        <div className="phonebar"><div className="sticky-cta"><div className="sticky-cta-info"><span className="sticky-cta-price">NT$250</span><span className="sticky-cta-sub">額滿・已有 2 人候補</span></div><button className="btn btn-ink btn-lg">加入候補（第 3 位）</button></div></div>
        <div className="phonebar"><div className="sticky-cta"><div className="sticky-cta-info"><span className="sticky-cta-price" style={{ fontSize: 18, fontFamily: "var(--font-body)", fontWeight: 700 }}>你已報名</span><span className="sticky-cta-sub">開始前 12 小時可免責取消</span></div><button className="btn btn-secondary btn-lg">取消報名</button></div></div>
      </div>
    </main>
  );
}
