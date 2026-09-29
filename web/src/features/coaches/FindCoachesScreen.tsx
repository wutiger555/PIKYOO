"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { LevelPicker } from "@/components/pk/LevelPicker";
import { AppBar, Sheet, SoonButton } from "@/components/pk/Shell";
import { COACHES, getCoach, isCertified } from "@/lib/data/coaches";
import { emptyCoachFilters, useDemo, type CoachFilters } from "@/lib/demo-store";
import { LEVELS, levelText, money } from "@/lib/format";
import type { Coach, LessonType } from "@/lib/types";
import { CoachCard, Photo } from "./CoachCard";

export function filterCoaches(list: Coach[], f: CoachFilters) {
  return list.filter((c) => {
    if (f.level != null && (f.level < c.levelMin || f.level > c.levelMax)) return false;
    if (f.type && !c.types.includes(f.type)) return false;
    if (f.cert && !isCertified(c)) return false;
    if (f.beg && !c.beginnerFriendly) return false;
    return true;
  });
}

/** F3-3 找教練: "我是【程度】，想上【類型】" need sentence, standard cards, compare up to 3. */
export function FindCoachesScreen() {
  const { coachFilters: f, setCoachFilters, compare } = useDemo();
  const [sheet, setSheet] = useState<"lv" | "cmp" | null>(null);
  const list = filterCoaches(COACHES, f);

  const typeChip = (t: LessonType) => (
    <button className="chip" aria-pressed={f.type === t} onClick={() => setCoachFilters((p) => ({ ...p, type: p.type === t ? null : t }))}>{t}</button>
  );
  const flagChip = (k: "cert" | "beg", label: string) => (
    <button className="chip" aria-pressed={f[k]} onClick={() => setCoachFilters((p) => ({ ...p, [k]: !p[k] }))}>{label}</button>
  );

  return (
    <>
      <AppBar
        title="找教練"
        back="/"
        historyBack
        action={
          <SoonButton className="btn btn-ghost btn-icon" msg="收藏的教練" aria-label="收藏">
            <Icon name="heart" size={22} />
          </SoonButton>
        }
      />
      <div className="scroll" style={{ paddingBottom: compare.length ? 96 : 24 }}>
        <div className="need">
          <div className="need-q">
            我是
            <button className="need-pick" onClick={() => setSheet("lv")}>
              {f.level != null ? LEVELS[f.level] : "選程度"}
              <Icon name="down" size={16} />
            </button>
            ，想上
          </div>
          <div className="chips">
            {typeChip("體驗課")}{typeChip("一對一")}{typeChip("小班")}{typeChip("團體")}
          </div>
          <div className="chips">
            {flagChip("cert", "已認證教練")}
            {flagChip("beg", "新手友善")}
            <SoonButton className="chip" msg="區域：大安・信義・中山（可多選）">
              <Icon name="pin" size={15} />大安・信義・中山
            </SoonButton>
          </div>
        </div>
        <div className="list-meta">
          <span><b>{list.length}</b> 位教練符合</span>
          <SoonButton className="sortbtn" msg="排序：最近可約／價格／評價">最近可約<Icon name="down" size={14} /></SoonButton>
        </div>
        <div className="stack pad">
          {list.length ? (
            list.map((c) => <CoachCard key={c.id} coach={c} />)
          ) : (
            <div className="empty-s">
              <h3>沒有符合的教練</h3>
              <p className="text-muted">放寬程度或類型看看。</p>
              <button className="btn btn-secondary" onClick={() => setCoachFilters(emptyCoachFilters())}>清除條件</button>
            </div>
          )}
        </div>
        <p className="fine pad">所有教練用同一張卡片格式，價格、程度、認證都寫在同一個位置，方便比較。</p>
      </div>

      {compare.length > 0 && (
        <div className="cmpbar carbon">
          <div className="cmp-avs">
            {compare.map((id) => (
              <span key={id} className="avatar" style={{ background: "#fff", color: "#121412" }}>{getCoach(id)?.initial}</span>
            ))}
          </div>
          <span style={{ flex: 1 }}>已選 {compare.length} 位</span>
          <button className="btn btn-primary" onClick={() => setSheet("cmp")} disabled={compare.length < 2}>
            <Icon name="cols" size={18} />比較
          </button>
        </div>
      )}

      {sheet === "lv" && (
        <Sheet className="sheet-coach" onClose={() => setSheet(null)}>
          <h2>你現在的程度？</h2>
          <p className="text-muted" style={{ fontSize: 14 }}>不確定就選「新手」，或花 3 分鐘做程度自評。</p>
          <LevelPicker
            lg
            value={f.level}
            onPick={(lv) => {
              setCoachFilters((p) => ({ ...p, level: p.level === lv ? null : lv }));
              setSheet(null);
            }}
          />
          <SoonButton className="btn btn-secondary btn-block" style={{ marginTop: "var(--space-4)" }} msg="程度自評（6–8 題，3 分鐘）">做程度自評</SoonButton>
        </Sheet>
      )}
      {sheet === "cmp" && <CompareSheet ids={compare} onClose={() => setSheet(null)} />}
    </>
  );
}

/** 比較教練: same field in the same row; lowest price flagged; DUPR marked self-reported. */
function CompareSheet({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const cs = ids.map(getCoach).filter((c): c is Coach => !!c);
  const low = Math.min(...cs.map((c) => c.priceFrom));
  const row = (label: string, cell: (c: Coach) => React.ReactNode) => (
    <tr>
      <th>{label}</th>
      {cs.map((c) => <td key={c.id}>{cell(c)}</td>)}
    </tr>
  );
  return (
    <Sheet onClose={onClose} style={{ maxHeight: "88%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>比較教練</h2>
        <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="關閉"><Icon name="x" size={22} /></button>
      </div>
      <div className="cmp-scroll">
        <table className="cmptable">
          <thead>
            <tr>
              <th />
              {cs.map((c) => (
                <td key={c.id}><div className="cmp-h"><Photo coach={c} size="sm" /><b>{c.name}</b></div></td>
              ))}
            </tr>
          </thead>
          <tbody>
            {row("認證", (c) => {
              const xs = c.creds.filter((x) => x.issuer !== "DUPR");
              return xs.length ? xs.map((x, i) => <div key={i}>{x.issuer} {x.level}</div>) : <span className="text-muted">未提供</span>;
            })}
            {row("DUPR", (c) => {
              const d = c.creds.find((x) => x.issuer === "DUPR");
              return d ? <><span className="num">{d.level}</span> <small className="text-muted">自填</small></> : "—";
            })}
            {row("程度", (c) => levelText(c.levelMin, c.levelMax))}
            {row("起價", (c) => (
              <>
                <b className="num" style={{ fontSize: 18 }}>{money(c.priceFrom)}</b>
                {c.priceFrom === low && <div><span className="tag tag-accent" style={{ fontSize: 11, padding: "3px 6px" }}>最低</span></div>}
              </>
            ))}
            {row("類型", (c) => c.types.map((t) => <div key={t}>{t}</div>))}
            {row("區域", (c) => c.areas.join("・"))}
            {row("教學年資", (c) => `${c.years} 年`)}
            {row("評價", (c) => (c.rating != null ? `${c.rating}（${c.reviews}）` : <span className="text-muted">尚無</span>))}
            {row("最近可約", (c) => c.nextSlot)}
            <tr>
              <th />
              {cs.map((c) => (
                <td key={c.id}>
                  <Link className="btn btn-secondary" style={{ minHeight: 38, padding: "0 12px", fontSize: 14, width: "100%" }} href={`/coaches/${c.id}`}>看教練頁</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Sheet>
  );
}
