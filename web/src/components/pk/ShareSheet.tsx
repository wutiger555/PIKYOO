"use client";

import { useGameView } from "@/lib/demo-store";
import type { Game } from "@/lib/types";
import { LevelChip, Sprout } from "./Badges";
import { Icon } from "./Icon";
import { PkMark } from "./Logo";
import { Sheet } from "./Shell";
import { useToast } from "./Toast";

/** F2-9 分享到 LINE 群組: preview of the Flex card as it lands in a group chat, then
 *  shareTargetPicker (in LIFF) or copy link (browser). Both are simulated in the MVP. */
export function ShareSheet({ game: g, onClose }: { game: Game; onClose: () => void }) {
  const toast = useToast();
  const { spots } = useGameView(g);
  const url = `https://pikyoo.tw/g/${g.id}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast("連結已複製，貼到群組就有預覽圖");
    } catch {
      toast(url);
    }
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <h2>分享到 LINE 群組</h2>
      <p className="text-muted" style={{ fontSize: 14, margin: "-4px 0 var(--space-3)" }}>群友會看到這張卡片，點「我要報名」就直接進球局。</p>
      <div className="line-preview" role="img" aria-label={`LINE 群組裡的球局卡片：${g.dayLabel} ${g.startsAt} ${g.venue}，${spots > 0 ? `缺 ${spots}` : "額滿"}`}>
        <div className="line-msg">
          <span className="avatar">{g.host.initial}</span>
          <div className="flex-card">
            <div className="flex-head carbon">
              <span className="flex-brand"><PkMark size={14} style={{ color: "#fff" }} />PIKYOO 匹友</span>
              <span className="flex-day">{g.dayLabel} {g.date}</span>
              <span className="flex-time num">{g.startsAt}–{g.endsAt}</span>
            </div>
            <div className="flex-body">
              <b>{g.venue}</b>
              <span className="text-muted" style={{ fontSize: 12 }}>{g.district}・{g.courtKind}</span>
              <div className="ticket-tags">
                <LevelChip min={g.levelMin} max={g.levelMax} />
                {g.beginnerFriendly && <Sprout />}
              </div>
              <div className="flex-row">
                <span className="num" style={{ fontSize: 17, fontWeight: 600 }}>每人 NT${g.fee}</span>
                <b>{spots > 0 ? <span className="hl">缺 {spots}</span> : "額滿可候補"}</b>
              </div>
            </div>
            <div className="flex-btn">{spots > 0 ? "我要報名" : "加入候補"}</div>
          </div>
        </div>
      </div>
      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: "var(--space-4)" }} onClick={() => { toast("已開啟 LINE 分享（選擇群組）"); onClose(); }}>
        <Icon name="share" size={20} />選擇群組分享
      </button>
      <button className="btn btn-secondary btn-block" style={{ marginTop: "var(--space-2)" }} onClick={copy}>
        <Icon name="copy" size={18} />複製連結
      </button>
    </Sheet>
  );
}
