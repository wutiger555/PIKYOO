import { ImageResponse } from "next/og";
import { getGame } from "@/lib/source";
import { levelText, money } from "@pikyoo/core/format";

// F2-9: the preview a 球局 link gets in LINE / IG, with the seats left at the time it is fetched.

export const alt = "PIKYOO 匹友球局";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Noto Sans TC cut down to the characters on the card (Google Fonts `text=`); the full font is several MB. */
async function font(text: string, weight: number) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@${weight}&text=${encodeURIComponent(text)}`).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error("no font url");
  return { name: "Noto Sans TC", data: await fetch(url).then((r) => r.arrayBuffer()), weight: weight as 500 | 900, style: "normal" as const };
}

const CARBON = "#1A1D1B";
const OPTIC = "#D4EE3A";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const g = await getGame((await params).id);
  const spots = g ? g.capacity - g.participants.length : 0;
  const lines = g
    ? {
        day: `${g.dayLabel} ${g.date}`, time: `${g.startsAt}–${g.endsAt}`, venue: g.venue, where: [g.district, g.courtKind].filter(Boolean).join("・"),
        level: `程度 ${levelText(g.levelMin, g.levelMax)}`, fee: g.fee ? `每人 ${money(g.fee)}` : "免費", seats: spots > 0 ? `缺 ${spots}` : "額滿可候補",
      }
    : null;
  const text = "PIKYOO 匹友 雙北匹克球揪團 找場找課找球友" + (lines ? Object.values(lines).join("") + (g!.beginnerFriendly ? "新手友善" : "") : "");
  // without the font the card still renders (CJK as boxes) rather than failing the preview
  const fonts = await Promise.all([font(text, 500), font(text, 900)]).catch(() => undefined);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: CARBON, color: "#fff", padding: 64, fontFamily: "Noto Sans TC" }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 900, letterSpacing: 2 }}>
          <span style={{ width: 22, height: 22, borderRadius: 11, background: OPTIC, marginRight: 14 }} />
          PIKYOO 匹友
        </div>
        {lines ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "flex-end" }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 500, color: "#B8BEA9" }}>{lines.day}</div>
            <div style={{ display: "flex", fontSize: 120, fontWeight: 900, lineHeight: 1.05 }}>{lines.time}</div>
            <div style={{ display: "flex", fontSize: 56, fontWeight: 900, marginTop: 16 }}>{lines.venue}</div>
            <div style={{ display: "flex", fontSize: 32, fontWeight: 500, color: "#B8BEA9", marginTop: 4 }}>{lines.where}</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 36, fontSize: 34, fontWeight: 500 }}>
              <span>{lines.level}</span>
              <span style={{ margin: "0 20px", color: "#6F775D" }}>|</span>
              <span>{lines.fee}</span>
              {g!.beginnerFriendly && <span style={{ marginLeft: 20, padding: "4px 18px", borderRadius: 999, border: "2px solid #6F775D" }}>新手友善</span>}
              <span style={{ marginLeft: "auto", padding: "10px 32px", borderRadius: 999, background: spots > 0 ? OPTIC : "#4A513B", color: spots > 0 ? CARBON : "#fff", fontSize: 44, fontWeight: 900 }}>
                {lines.seats}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", fontSize: 88, fontWeight: 900 }}>雙北匹克球揪團</div>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 500, color: "#B8BEA9", marginTop: 12 }}>找場找課找球友</div>
          </div>
        )}
      </div>
    ),
    { ...size, fonts },
  );
}
