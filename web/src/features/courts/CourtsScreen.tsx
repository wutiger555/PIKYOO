"use client";

import Link from "next/link";
import { useState } from "react";
import { CourtArt } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { AppBar } from "@/components/pk/Shell";
import { COURTS } from "@/lib/data/courts";
import type { Court } from "@/lib/types";

type Chip = "室內" | "室外" | "風雨" | "free" | "aircon" | "lights";
const CHIPS: [Chip, string][] = [["室內", "室內"], ["室外", "室外"], ["風雨", "風雨球場"], ["free", "免費"], ["aircon", "有冷氣"], ["lights", "夜間照明"]];

const match = (c: Court, on: Chip[]) => {
  const kinds = on.filter((x) => x === "室內" || x === "室外" || x === "風雨");
  if (kinds.length && !kinds.includes(c.kind)) return false;
  if (on.includes("free") && !c.free) return false;
  if (on.includes("aircon") && !c.aircon) return false;
  if (on.includes("lights") && !c.lights) return false;
  return true;
};

/** F4-1 球場列表＋地圖: list / map toggle, quick filters, booking method on every row. */
export function CourtsScreen() {
  const [view, setView] = useState<"list" | "map">("list");
  const [on, setOn] = useState<Chip[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const list = COURTS.filter((c) => match(c, on));
  const pick = list.find((c) => c.id === picked) ?? null;

  return (
    <>
      <AppBar title="找球場" back="/" historyBack />
      <div className="list-head" style={{ paddingTop: "var(--space-3)" }}>
        <div className="seg" style={{ display: "flex" }} role="radiogroup" aria-label="顯示方式">
          <label className="seg-opt"><input type="radio" name="v" checked={view === "list"} onChange={() => setView("list")} />列表</label>
          <label className="seg-opt"><input type="radio" name="v" checked={view === "map"} onChange={() => setView("map")} />地圖</label>
        </div>
        <div className="chips">
          {CHIPS.map(([k, l]) => (
            <button key={k} className="chip" aria-pressed={on.includes(k)} onClick={() => setOn((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))}>{l}</button>
          ))}
        </div>
      </div>

      {view === "map" ? (
        <div className="scroll court-map-wrap">
          <div className="court-map ph" aria-label="球場地圖（Google Maps 接上前的示意）">
            <span className="court-map-note">地圖示意・正式版接 Google Maps</span>
            {list.map((c) => (
              <button
                key={c.id}
                className="map-pin"
                aria-pressed={picked === c.id}
                style={{ left: `${c.map[0]}%`, top: `${c.map[1]}%` }}
                onClick={() => setPicked(c.id)}
                aria-label={c.name}
              >
                <Icon name="pin" size={20} />
              </button>
            ))}
          </div>
          {pick ? (
            <div className="pad" style={{ marginTop: "var(--space-3)" }}><CourtRow c={pick} card /></div>
          ) : (
            <p className="text-muted pad" style={{ fontSize: 14, marginTop: "var(--space-3)" }}>點地圖上的球場看詳情。共 {list.length} 處。</p>
          )}
        </div>
      ) : (
        <div className="scroll" style={{ paddingBottom: "var(--space-6)" }}>
          {list.length ? (
            <>
              <div className="date-h"><b>雙北球場</b><span>{list.length} 處・依距離</span></div>
              <div className="pad">{list.map((c) => <CourtRow key={c.id} c={c} />)}</div>
            </>
          ) : (
            <div className="empty">
              <CourtArt />
              <h3 style={{ margin: 0 }}>沒有符合的球場</h3>
              <p className="text-muted" style={{ margin: 0 }}>少選幾個條件看看。</p>
              <button className="btn btn-secondary" onClick={() => setOn([])}>清除篩選</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function CourtRow({ c, card }: { c: Court; card?: boolean }) {
  return (
    <Link href={`/courts/${c.id}`} className={card ? "card court-card" : "row-item court-row court-item"}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, overflowWrap: "anywhere" }}>{c.name}</div>
        <div className="text-muted" style={{ fontSize: 14 }}>{c.district}・{c.kind} {c.courtCount} 面・{c.free ? "免費" : "付費"}</div>
        <div className="ticket-tags" style={{ marginTop: 6 }}>
          <span className="tag tag-outline">{c.booking}</span>
          {c.verified && <span className="tag tag-neutral"><Icon name="check" size={13} stroke={2.2} />PIKYOO 已確認 {c.verified}</span>}
        </div>
      </div>
      <span className="num text-muted">{c.distance}</span>
      <Icon name="right" size={18} />
    </Link>
  );
}
