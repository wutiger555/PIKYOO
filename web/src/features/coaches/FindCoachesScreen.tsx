"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { LevelPicker } from "@/components/pk/LevelPicker";
import { Sheet, SoonButton, TabBar } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { isCertified } from "@pikyoo/core/data/coaches";
import { emptyCoachFilters, useCoaches, useDemo, type CoachFilters } from "@/lib/demo-store";
import { LEVELS, levelText, money } from "@pikyoo/core/format";
import type { Coach, LessonType } from "@pikyoo/core/types";
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

/** F3-3 找教練: "我是【程度】，想上【類型】" need sentence, standard cards, compare up to 3.
 *  Desktop (`.dk`, ≥1024px): top nav, the sentence as a header, filter sidebar, two-column card grid. */
export function FindCoachesScreen() {
  const { coachFilters: f, setCoachFilters, compare } = useDemo();
  const coaches = useCoaches();
  const [sheet, setSheet] = useState<"lv" | "cmp" | null>(null);
  const list = filterCoaches(coaches, f);
  const initialOf = (id: string) => coaches.find((c) => c.id === id)?.initial;

  const typeChip = (t: LessonType) => (
    <button className="chip" aria-pressed={f.type === t} onClick={() => setCoachFilters((p) => ({ ...p, type: p.type === t ? null : t }))}>{t}</button>
  );
  const flagChip = (k: "cert" | "beg", label: string) => (
    <button className="chip" aria-pressed={f[k]} onClick={() => setCoachFilters((p) => ({ ...p, [k]: !p[k] }))}>{label}</button>
  );
  const flagCheck = (k: "cert" | "beg", label: string, sub: string) => (
    <label className="fc-check">
      <input type="checkbox" checked={f[k]} onChange={() => setCoachFilters((p) => ({ ...p, [k]: !p[k] }))} />
      <span><b>{label}</b><small>{sub}</small></span>
    </label>
  );
  const anyFilter = f.level != null || f.type != null || f.cert || f.beg;

  return (
    <>
      <div className="scroll dk fc" style={{ paddingBottom: compare.length ? 96 : 24 }}>
        <TopNav active="coaches" />
        <div className="fc-wrap">
        <div className="need">
          <div className="need-top">
            <h1>找教練</h1>
            <SoonButton className="btn btn-ghost btn-icon" msg="收藏的教練" aria-label="收藏">
              <Icon name="heart" size={22} />
            </SoonButton>
          </div>
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
          <div className="chips mb-only">
            {flagChip("cert", "已認證教練")}
            {flagChip("beg", "新手友善")}
            <SoonButton className="chip" msg="區域：大安・信義・中山（可多選）">
              <Icon name="pin" size={15} />大安・信義・中山
            </SoonButton>
          </div>
        </div>
        <div className="fc-cols">
        <aside className="fc-side dk-only" aria-label="篩選">
          <h3>篩選</h3>
          {flagCheck("cert", "已認證教練", "協會、總會、PPR、IPTPA 查驗過")}
          {flagCheck("beg", "新手友善", "專帶第一次拿拍的人")}
          <h3>區域</h3>
          <SoonButton className="chip fc-soon" msg="區域：大安・信義・中山（可多選）"><Icon name="pin" size={15} />大安・信義・中山</SoonButton>
          <h3>價格與時段</h3>
          <SoonButton className="chip fc-soon" msg="價格區間（下一輪）">價格區間</SoonButton>
          <SoonButton className="chip fc-soon" msg="平日晚上／週末（下一輪）">平日晚上・週末</SoonButton>
          {anyFilter && <button className="linkbtn fc-clear" onClick={() => setCoachFilters(emptyCoachFilters())}>清除所有條件</button>}
        </aside>
        <div className="fc-main">
        <div className="list-meta">
          <span><b>{list.length}</b> 位教練符合</span>
          <SoonButton className="sortbtn" msg="排序：最近可約／價格／評價">最近可約<Icon name="down" size={14} /></SoonButton>
        </div>
        <div className="stack pad fc-grid">
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
        <p className="fine pad">所有教練用同一張卡片格式，價格、程度、認證都寫在同一個位置，方便比較。Demo 的教練照片為免費圖庫的示意照，不是教練本人。</p>
        </div>
        </div>
        </div>
      </div>
      {compare.length === 0 && <TabBar active="coaches" />}

      {compare.length > 0 && (
        <div className="cmpbar carbon">
          <div className="cmp-avs">
            {compare.map((id) => (
              <span key={id} className="avatar" style={{ background: "#fff", color: "#121412" }}>{initialOf(id)}</span>
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
          <Link className="btn btn-secondary btn-block" style={{ marginTop: "var(--space-4)" }} href="/learn/level-check">做程度自評</Link>
        </Sheet>
      )}
      {sheet === "cmp" && <CompareSheet ids={compare} onClose={() => setSheet(null)} />}
    </>
  );
}

/** 比較教練: same field in the same row; lowest price flagged; DUPR marked self-reported. */
function CompareSheet({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const coaches = useCoaches();
  const cs = ids.map((id) => coaches.find((c) => c.id === id)).filter((c): c is Coach => !!c);
  const low = Math.min(...cs.map((c) => c.priceFrom));
  const row = (label: string, cell: (c: Coach) => React.ReactNode) => (
    <tr>
      <th>{label}</th>
      {cs.map((c) => <td key={c.id}>{cell(c)}</td>)}
    </tr>
  );
  return (
    <Sheet className="sheet-wide" onClose={onClose} style={{ maxHeight: "88%", display: "flex", flexDirection: "column" }}>
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
