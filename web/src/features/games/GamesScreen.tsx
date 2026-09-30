"use client";

import { useState } from "react";
import { CourtArt } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { LevelPicker } from "@/components/pk/LevelPicker";
import Link from "next/link";
import { Sheet, TabBar } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { GameTicket } from "@/components/pk/Ticket";
import { shortAreas } from "@/lib/data/courts";
import { AREAS, DAY_GROUPS } from "@/lib/data/games";
import { emptyGameFilters, useAllGames, useDemo, type GameFilters } from "@/lib/demo-store";
import type { DayGroup } from "@/lib/types";
import { filterGames, sheetFilterCount } from "./filters";

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

/** F2 球局列表: quick chips, filter sheet, date-grouped tickets, empty state. */
export function GamesScreen() {
  const { gameFilters: f, setGameFilters, mine, profile } = useDemo();
  const [sheet, setSheet] = useState(false);
  const list = filterGames(useAllGames(), f, mine);
  const fc = sheetFilterCount(f);

  const dayChip = (k: NonNullable<GameFilters["day"]>, label: string) => (
    <button className="chip" aria-pressed={f.day === k} onClick={() => setGameFilters((p) => ({ ...p, day: p.day === k ? null : k }))}>{label}</button>
  );
  const chip = (k: GameFilters["chips"][number], label: string) => (
    <button className="chip" aria-pressed={f.chips.includes(k)} onClick={() => setGameFilters((p) => ({ ...p, chips: toggle(p.chips, k) }))}>{label}</button>
  );

  // The phone keeps the head above the scroller; desktop renders it inside the page (the outer one is hidden there).
  const head = (
    <>
      <div className="t">
        <h1>找球友打球</h1>
        <span className="text-muted" style={{ fontSize: 14 }}>{shortAreas(profile.areas)}</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div className="chips" style={{ flex: 1 }}>
          {dayChip("today", "今天")}
          {dayChip("tomorrow", "明天")}
          {dayChip("weekend", "週末")}
          {chip("eve", "晚上")}
          {chip("beg", "新手友善")}
          {chip("open", "有空位")}
        </div>
        <button className="btn btn-icon btn-secondary filter-btn" onClick={() => setSheet(true)} aria-label="更多篩選">
          <Icon name="sliders" size={20} />
          {fc > 0 && <span className="dot">{fc}</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="list-head">{head}</div>

      <div className="scroll dk games" style={{ paddingBottom: "var(--space-6)" }}>
        <TopNav active="games" />
        <div className="games-in">
        <div className="list-head dk-only dk-head">
          {head}
          <Link className="btn btn-primary games-new" href="/games/new"><Icon name="plus" size={18} />開一團</Link>
        </div>
        {list.length ? (
          (Object.keys(DAY_GROUPS) as DayGroup[]).map((k) => {
            const gs = list.filter((g) => g.group === k);
            if (!gs.length) return null;
            return (
              <div key={k}>
                <div className="date-h"><b>{DAY_GROUPS[k]}</b><span>{gs.length} 局</span></div>
                <div className="stack pad games-grid">{gs.map((g) => <GameTicket key={g.id} game={g} />)}</div>
              </div>
            );
          })
        ) : (
          <div className="empty">
            <CourtArt />
            <h3 style={{ margin: 0 }}>這週還沒有局，自己開一團吧？</h3>
            <p className="text-muted" style={{ margin: 0 }}>或放寬篩選條件看看。</p>
            <div className="btnrow" style={{ width: "100%" }}>
              <button className="btn btn-secondary" onClick={() => setGameFilters(emptyGameFilters())}>清除篩選</button>
              <Link className="btn btn-primary" href="/games/new">開一團</Link>
            </div>
          </div>
        )}
        </div>
      </div>
      <TabBar />

      {sheet && <FilterSheet count={list.length} onClose={() => setSheet(false)} />}
    </>
  );
}

function FilterSheet({ count, onClose }: { count: number; onClose: () => void }) {
  const { gameFilters: f, setGameFilters } = useDemo();
  const times: [NonNullable<GameFilters["time"]>, string][] = [["am", "早上"], ["pm", "下午"], ["eve", "晚上"]];
  return (
    <Sheet onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>篩選</h2>
        <button className="btn btn-ghost" onClick={() => setGameFilters((p) => ({ ...p, areas: [], time: null, openOnly: false, level: null }))}>清除</button>
      </div>
      <div className="opt-group">
        <b>區域</b>
        <div className="wrapchips">
          {AREAS.map((a) => (
            <button key={a} className="chip" aria-pressed={f.areas.includes(a)} onClick={() => setGameFilters((p) => ({ ...p, areas: toggle(p.areas, a) }))}>{a}</button>
          ))}
        </div>
      </div>
      <div className="opt-group">
        <b>時段</b>
        <div className="seg" style={{ display: "flex" }} role="radiogroup">
          {times.map(([k, l]) => (
            <label key={k} className="seg-opt">
              <input type="radio" name="t" checked={f.time === k} onChange={() => setGameFilters((p) => ({ ...p, time: k }))} />
              {l}
            </label>
          ))}
        </div>
      </div>
      <div className="opt-group">
        <b>我的程度可以打</b>
        <LevelPicker value={f.level} onPick={(lv) => setGameFilters((p) => ({ ...p, level: p.level === lv ? null : lv }))} />
      </div>
      <div className="opt-group" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <b>只看有空位</b>
        <button className="switch" role="switch" aria-checked={f.openOnly} aria-label="只看有空位" onClick={() => setGameFilters((p) => ({ ...p, openOnly: !p.openOnly }))} />
      </div>
      <button className="btn btn-primary btn-lg btn-block" onClick={onClose}>顯示 {count} 局</button>
    </Sheet>
  );
}
