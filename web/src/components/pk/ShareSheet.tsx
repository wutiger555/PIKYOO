"use client";

import { useGameView } from "@/lib/demo-store";
import { shareToLine } from "@/lib/line";
import { levelText } from "@pikyoo/core/format";
import type { Game } from "@pikyoo/core/types";
import { LevelChip, Sprout } from "./Badges";
import { Icon } from "./Icon";
import { PkMark } from "./Logo";
import { Sheet } from "./Shell";
import { useToast } from "./Toast";

/** F2-9 分享到 LINE 群組: preview of the Flex card as it lands in a group chat, then
 *  shareTargetPicker (in LIFF) or LINE's share page, or copy the link (its preview image is opengraph-image.tsx). */
export function ShareSheet({ game: g, onClose }: { game: Game; onClose: () => void }) {
  const toast = useToast();
  const { spots } = useGameView(g);
  const url = `${location.origin}/games/${g.id}`;
  const seats = spots > 0 ? `缺 ${spots}` : "額滿可候補";
  const summary = `${g.dayLabel} ${g.date} ${g.startsAt}–${g.endsAt}\n${g.venue}・程度 ${levelText(g.levelMin, g.levelMax)}・每人 NT$${g.fee}・${seats}`;

  const share = async () => {
    try {
      if (await shareToLine(`🏓 ${summary}\n${url}`, () => flexCard(g, url, seats, spots > 0))) onClose();
    } catch (e) {
      toast((e as Error).message);
    }
  };

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
      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: "var(--space-4)" }} onClick={share}>
        <Icon name="share" size={20} />選擇群組分享
      </button>
      <button className="btn btn-secondary btn-block" style={{ marginTop: "var(--space-2)" }} onClick={copy}>
        <Icon name="copy" size={18} />複製連結
      </button>
    </Sheet>
  );
}

/** The card shareTargetPicker posts: the same content as the preview above, in LINE's Flex Message JSON. */
function flexCard(g: Game, url: string, seats: string, open: boolean) {
  const t = (text: string, more: object = {}) => ({ type: "text", text, wrap: true, ...more });
  return {
    type: "flex",
    altText: `${g.dayLabel} ${g.startsAt} ${g.venue}｜${seats}`,
    contents: {
      type: "bubble",
      header: {
        type: "box", layout: "vertical", backgroundColor: "#1A1D1B", contents: [
          t("PIKYOO 匹友", { size: "xs", color: "#D4EE3A", weight: "bold" }),
          t(`${g.dayLabel} ${g.date}`, { size: "sm", color: "#B8BEA9" }),
          t(`${g.startsAt}–${g.endsAt}`, { size: "xxl", color: "#FFFFFF", weight: "bold" }),
        ],
      },
      body: {
        type: "box", layout: "vertical", spacing: "sm", contents: [
          t(g.venue, { weight: "bold", size: "lg" }),
          t([g.district, g.courtKind].filter(Boolean).join("・"), { size: "xs", color: "#6F775D" }),
          t(`程度 ${levelText(g.levelMin, g.levelMax)}${g.beginnerFriendly ? "・新手友善" : ""}`, { size: "sm" }),
          { type: "box", layout: "horizontal", contents: [t(`每人 NT$${g.fee}`, { size: "md" }), t(seats, { size: "md", weight: "bold", align: "end" })] },
        ],
      },
      footer: {
        type: "box", layout: "vertical", contents: [
          { type: "button", style: "primary", color: "#1A1D1B", action: { type: "uri", label: open ? "我要報名" : "加入候補", uri: url } },
        ],
      },
    },
  };
}
