"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { PkMark } from "@/components/pk/Logo";
import { AppBar, SoonButton } from "@/components/pk/Shell";
import { useToast } from "@/components/pk/Toast";
import { CoachPublicPage } from "@/features/coaches/CoachPageScreen";
import { Img } from "@/features/coaches/CoachCard";
import { COURTS } from "@pikyoo/core/data/courts";
import { useDemo } from "@/lib/demo-store";
import { LEVELS } from "@pikyoo/core/format";
import type { Coach, CoachProfile, Level, PayMethod, PlayProfile, TimelineItem } from "@pikyoo/core/types";
import { CoachTabs, ConsoleFrame } from "./ConsoleScreens";

const STRENGTHS = ["零基礎入門", "發球與接發球", "網前小球（dink）", "第三拍 drop", "重置球（reset）", "截擊", "快速對抽（hands battle）", "雙打站位與換位", "單打戰術", "比賽策略", "網球轉匹克球的揮拍修正", "親子課"];
const AUDIENCE = ["第一次拿拍", "打過網球、羽球想轉項", "想先上課再去打新手局", "2.5–3.0 想升級", "準備參加積分賽", "一個人想找球伴", "跟朋友一起來的小班", "親子一起學", "銀髮族", "英文授課需求"];
const AREAS = ["大安", "信義", "中山", "松山", "大同", "中正", "內湖", "南港", "士林", "北投", "文山", "萬華", "板橋", "新店", "中和", "永和"];
const PAYS: PayMethod[] = ["LINE Pay", "銀行轉帳", "現場付現"];
const KIND_LABEL: Record<TimelineItem["kind"], string> = { cert: "證照", trophy: "賽事成績", users: "教學", cap: "運動經歷" };

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

/** Page-completeness checks, from the live draft (F5-2). */
export function completeness(c: Coach): [string, boolean][] {
  const p = c.profile;
  return [
    ["照片 3 張以上", p.photos.length >= 3],
    ["自我介紹 40 字以上", p.bio.length >= 40],
    ["匹克球檔案：擅長 2 項以上", p.play.strengths.length >= 2],
    ["適合誰 2 項以上", p.audience.length >= 2],
    ["課程方案", p.plans.length > 0],
    ["每週開放時段", Object.values(p.availability).some((x) => x && x.length)],
    ["授課地點", p.venues.length > 0],
    ["教學影片", false],
  ];
}

/** 我的教練頁（編輯）: every section of the public page is a form here; desktop shows a live phone preview beside it. */
export function CoachPageEditor() {
  const toast = useToast();
  const { myCoach: c, setMyCoach } = useDemo();
  const [preview, setPreview] = useState(false);
  const p = c.profile;
  const setC = (patch: Partial<Coach>) => setMyCoach((x) => ({ ...x, ...patch }));
  const setP = (patch: Partial<CoachProfile>) => setMyCoach((x) => ({ ...x, profile: { ...x.profile, ...patch } }));
  const setPlay = (patch: Partial<PlayProfile>) => setP({ play: { ...p.play, ...patch } });
  const checks = completeness(c);
  const pct = Math.round((checks.filter((x) => x[1]).length / checks.length) * 100);
  const dupr = c.creds.find((x) => x.issuer === "DUPR");

  const addPhotos = (files: FileList | null) => {
    if (!files?.length) return;
    const added = [...files].slice(0, 10).map((f) => ({ src: URL.createObjectURL(f), alt: `${c.name} 的上課照片`, caption: "" }));
    setP({ photos: [...p.photos, ...added] });
    toast(`已加入 ${added.length} 張照片（接上 Supabase Storage 後會真的上傳）`);
  };
  const movePhoto = (i: number, to: number) => {
    const xs = [...p.photos];
    const [ph] = xs.splice(i, 1);
    xs.splice(to, 0, ph);
    setP({ photos: xs });
  };
  const setDupr = (v: string) => {
    const rest = c.creds.filter((x) => x.issuer !== "DUPR");
    setC({ creds: v ? [...rest, { issuer: "DUPR", level: v, verified: false }] : rest });
  };

  return (
    <>
      <AppBar
        title="我的教練頁"
        action={<button className="btn btn-ghost btn-icon ed-preview-btn" onClick={() => setPreview(true)} aria-label="預覽"><Icon name="image" size={22} /></button>}
      />
      <ConsoleFrame active="page">
      <h1 className="con-titlebar dk-only">我的教練頁</h1>
      <div className="console-wide">
        <div className="editor">
          <section className="ed-card ed-head">
            <div className="linkcard">
              <div style={{ flex: 1, minWidth: 0 }}>
                <small className="text-muted">你的專屬連結，放在 IG／Threads 個人簡介</small>
                <div className="num" style={{ fontSize: 20, fontWeight: 600 }}>{p.slug}</div>
              </div>
              <Link className="btn btn-secondary" href={`/coaches/${c.id}`}>看公開頁</Link>
            </div>
            <div className="sec-head" style={{ marginTop: 16, marginBottom: 6 }}><h3>頁面完整度</h3><b className="num" style={{ fontSize: 20 }}>{pct}%</b></div>
            <div className="bar light"><i style={{ width: `${pct}%` }} /></div>
            <ul className="checklist">
              {checks.map(([t, ok]) => (
                <li key={t} className={ok ? "ok" : ""}><i>{ok && <Icon name="check" size={12} stroke={3} />}</i>{t}</li>
              ))}
            </ul>
          </section>

          <section className="ed-card">
            <h2><span className="en">Photos</span>照片</h2>
            <p className="ed-hint">第一張是封面。放真實的上課照片最能讓學生放心：你教學的樣子、球場、學生上課的畫面。</p>
            <div className="ed-photos">
              {p.photos.map((ph, i) => (
                <figure key={ph.src} className="ed-photo">
                  <div className="ed-photo-img">
                    <Img src={ph.src} alt={ph.alt} sizes="160px" />
                    {i === 0 && <span className="ed-cover-tag">封面</span>}
                  </div>
                  <input className="input ed-cap" aria-label={`第 ${i + 1} 張照片說明`} placeholder="照片說明" value={ph.caption ?? ""} onChange={(e) => setP({ photos: p.photos.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)) })} />
                  <div className="ed-photo-acts">
                    {i > 0 && <button className="linkbtn" onClick={() => movePhoto(i, 0)}>設為封面</button>}
                    {i > 0 && <button className="btn btn-ghost btn-icon" aria-label="往前" onClick={() => movePhoto(i, i - 1)}><Icon name="left" size={18} /></button>}
                    <button className="btn btn-ghost btn-icon" aria-label="刪除照片" onClick={() => setP({ photos: p.photos.filter((_, j) => j !== i) })}><Icon name="x" size={18} /></button>
                  </div>
                </figure>
              ))}
              <label className="ed-add">
                <input type="file" accept="image/*" multiple onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
                <Icon name="plus" size={26} />
                上傳照片
              </label>
            </div>
          </section>

          <section className="ed-card">
            <h2><span className="en">Basics</span>基本資料</h2>
            <div className="field"><label htmlFor="ed-name">顯示名稱</label><input id="ed-name" className="input" value={c.name} maxLength={20} onChange={(e) => setC({ name: e.target.value })} /></div>
            <div className="field">
              <label htmlFor="ed-tag">一句話介紹 <small className="text-muted">（{c.tagline.length}/40，會出現在教練卡上）</small></label>
              <input id="ed-tag" className="input" value={c.tagline} maxLength={40} onChange={(e) => setC({ tagline: e.target.value })} />
            </div>
            <fieldset className="ed-fs">
              <legend>授課區域</legend>
              <div className="wrapchips">{AREAS.map((a) => <button key={a} type="button" className="chip" aria-pressed={c.areas.includes(a)} onClick={() => setC({ areas: toggle(c.areas, a) })}>{a}</button>)}</div>
            </fieldset>
            <div className="ed-2">
              <div className="field">
                <label htmlFor="ed-lmin">授課程度（最低）</label>
                <select id="ed-lmin" className="input" value={c.levelMin} onChange={(e) => setC({ levelMin: Number(e.target.value) as Level })}>{LEVELS.map((l, i) => <option key={l} value={i}>{l}</option>)}</select>
              </div>
              <div className="field">
                <label htmlFor="ed-lmax">授課程度（最高）</label>
                <select id="ed-lmax" className="input" value={c.levelMax} onChange={(e) => setC({ levelMax: Number(e.target.value) as Level })}>{LEVELS.map((l, i) => <option key={l} value={i}>{l}</option>)}</select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="ed-reply">回覆速度</label>
              <select id="ed-reply" className="input" value={p.reply} onChange={(e) => setP({ reply: e.target.value })}>
                {["通常 1 小時內回覆", "通常 2 小時內回覆", "通常當天回覆", "通常 1–2 天內回覆"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
          </section>

          <section className="ed-card">
            <h2><span className="en">About</span>關於我與上課方式</h2>
            <div className="field">
              <label htmlFor="ed-bio">自我介紹 <small className="text-muted">（{p.bio.length} 字，建議 40–200 字）</small></label>
              <textarea id="ed-bio" className="input" rows={5} value={p.bio} onChange={(e) => setP({ bio: e.target.value })} placeholder="你的教學理念、第一堂課學生會學到什麼" />
            </div>
            <fieldset className="ed-fs">
              <legend>上課怎麼進行（3 步）</legend>
              {p.steps.map((st, i) => (
                <div key={i} className="ed-step"><b className="num">{i + 1}</b><input className="input" aria-label={`第 ${i + 1} 步`} value={st} onChange={(e) => setP({ steps: p.steps.map((x, j) => (j === i ? e.target.value : x)) })} /></div>
              ))}
            </fieldset>
            <TagEditor label="教學風格標籤" values={c.style} onChange={(style) => setC({ style })} placeholder="例：影片回饋" />
            <fieldset className="ed-fs">
              <legend>適合誰</legend>
              <div className="wrapchips">{AUDIENCE.map((a) => <button key={a} type="button" className="chip" aria-pressed={p.audience.includes(a)} onClick={() => setP({ audience: toggle(p.audience, a) })}>{a}</button>)}</div>
            </fieldset>
          </section>

          <section className="ed-card">
            <h2><span className="en">Pickleball</span>匹克球檔案</h2>
            <p className="ed-hint">學生最常比較的資訊。DUPR 填了會標「自填」，送驗證後改成「已驗證」。</p>
            <div className="ed-2">
              <div className="field">
                <label htmlFor="ed-since">開始打匹克球</label>
                <select id="ed-since" className="input" value={p.play.since} onChange={(e) => setPlay({ since: e.target.value })}>{["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"].map((y) => <option key={y}>{y}</option>)}</select>
              </div>
              <div className="field">
                <label htmlFor="ed-dupr">DUPR 分數（選填）</label>
                <input id="ed-dupr" className="input num" inputMode="decimal" placeholder="例：4.21" value={dupr?.level ?? ""} onChange={(e) => setDupr(e.target.value.replace(/[^\d.]/g, "").slice(0, 4))} />
              </div>
            </div>
            <div className="ed-2">
              <fieldset className="ed-fs">
                <legend>慣用手</legend>
                <div className="seg" style={{ display: "flex" }} role="radiogroup">
                  {(["右手", "左手"] as const).map((h) => <label key={h} className="seg-opt"><input type="radio" name="hand" checked={p.play.hand === h} onChange={() => setPlay({ hand: h })} />{h}</label>)}
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="ed-format">打法</label>
                <select id="ed-format" className="input" value={p.play.format} onChange={(e) => setPlay({ format: e.target.value })}>{["雙打為主", "單打為主", "單打、雙打都教"].map((x) => <option key={x}>{x}</option>)}</select>
              </div>
            </div>
            <div className="field"><label htmlFor="ed-bg">運動背景</label><input id="ed-bg" className="input" value={p.play.background} placeholder="例：網球教練 8 年" onChange={(e) => setPlay({ background: e.target.value })} /></div>
            <fieldset className="ed-fs">
              <legend>擅長教 <small className="text-muted">（第一項會出現在教練卡）</small></legend>
              <div className="wrapchips">{[...new Set([...p.play.strengths, ...STRENGTHS])].map((s) => <button key={s} type="button" className="chip" aria-pressed={p.play.strengths.includes(s)} onClick={() => setPlay({ strengths: toggle(p.play.strengths, s) })}>{s}</button>)}</div>
            </fieldset>
            <TagEditor label="授課語言" values={p.languages} onChange={(languages) => setP({ languages })} placeholder="例：台語" />
          </section>

          <section className="ed-card">
            <h2><span className="en">Experience</span>經歷與證照</h2>
            <p className="ed-hint">證照上傳後由 PIKYOO 比對協會／總會公開名單，通過後顯示「已查驗」徽章。</p>
            {p.timeline.map((t, i) => (
              <div key={i} className="ed-tl">
                <input className="input num" aria-label="年份" value={t.year} onChange={(e) => setP({ timeline: p.timeline.map((x, j) => (j === i ? { ...x, year: e.target.value } : x)) })} />
                <select className="input" aria-label="類型" value={t.kind} onChange={(e) => setP({ timeline: p.timeline.map((x, j) => (j === i ? { ...x, kind: e.target.value as TimelineItem["kind"] } : x)) })}>
                  {(Object.keys(KIND_LABEL) as TimelineItem["kind"][]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                </select>
                <input className="input" aria-label="內容" value={t.text} onChange={(e) => setP({ timeline: p.timeline.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
                <button className="btn btn-ghost btn-icon" aria-label="刪除這筆" onClick={() => setP({ timeline: p.timeline.filter((_, j) => j !== i) })}><Icon name="x" size={18} /></button>
              </div>
            ))}
            <div className="btnrow">
              <button className="btn btn-secondary" onClick={() => setP({ timeline: [{ year: "2026", text: "", kind: "trophy" }, ...p.timeline] })}><Icon name="plus" size={18} />新增經歷</button>
              <SoonButton className="btn btn-secondary" msg="證照已送審，通常 2 個工作天內完成（接上後台後開放）"><Icon name="medal" size={18} />上傳證照送審</SoonButton>
            </div>
          </section>

          <section className="ed-card">
            <h2><span className="en">Where</span>授課地點</h2>
            {COURTS.map((ct) => {
              const on = p.venues.some((v) => v.courtId === ct.id);
              return (
                <label key={ct.id} className="ed-check">
                  <input type="checkbox" checked={on} onChange={() => setP({ venues: on ? p.venues.filter((v) => v.courtId !== ct.id) : [...p.venues, { name: ct.name, sub: `${ct.kind} ${ct.courtCount} 面・${ct.district}`, courtId: ct.id }] })} />
                  <span><b>{ct.name}</b><small className="text-muted">{ct.district}・{ct.kind} {ct.courtCount} 面</small></span>
                </label>
              );
            })}
          </section>

          <section className="ed-card">
            <h2><span className="en">Payment</span>付款與取消</h2>
            <fieldset className="ed-fs">
              <legend>學生可以用的付款方式</legend>
              <div className="wrapchips">{PAYS.map((x) => <button key={x} type="button" className="chip" aria-pressed={p.pay.includes(x)} onClick={() => setP({ pay: toggle(p.pay, x) })}>{x}</button>)}</div>
            </fieldset>
            <div className="field"><label htmlFor="ed-policy">取消規則</label><textarea id="ed-policy" className="input" rows={2} value={p.policy} onChange={(e) => setP({ policy: e.target.value })} /></div>
            <p className="ed-hint" style={{ margin: 0 }}>課程方案與每週時段在 <Link href="/coach/lessons">課程時段</Link> 設定。</p>
          </section>

          <section className="ed-card">
            <h2><span className="en">Share</span>分享招生素材</h2>
            <p className="ed-hint">一鍵產生，圖上自動帶你的封面照、課程、價格和短網址。</p>
            <div className="assets">
              <SoonButton className="asset" msg="下載 IG 限動圖 1080×1920">
                <div className="a-story carbon" style={{ position: "relative" }}>
                  {p.photos[0] && <Img src={p.photos[0].src} alt="" sizes="120px" />}
                  <span className="a-shade" />
                  <PkMark size={22} style={{ color: "#fff", position: "relative" }} />
                  <b style={{ position: "relative" }}>{p.plans[0]?.name}</b>
                  <span className="num a-price" style={{ position: "relative" }}>NT${c.priceFrom}</span>
                  <i style={{ position: "relative" }}>{p.slug}</i>
                </div>
                <span>限動 9:16</span>
              </SoonButton>
              <SoonButton className="asset" msg="下載 Threads／IG 貼文圖 1080×1350">
                <div className="a-post">
                  <div style={{ position: "relative", height: "58%", borderRadius: 4, overflow: "hidden" }}>{p.photos[0] && <Img src={p.photos[0].src} alt="" sizes="120px" />}</div>
                  <b>{c.name}｜{c.creds[0]?.issuer}{c.creds[0]?.level}</b>
                  <span>{p.plans[0]?.name} NT${c.priceFrom} 起</span>
                </div>
                <span>貼文 4:5</span>
              </SoonButton>
              <SoonButton className="asset" msg="分享 LINE Flex 卡片到群組">
                <div className="a-flex">
                  <div style={{ position: "relative", height: 70, borderRadius: "6px 6px 0 0", overflow: "hidden" }}>{p.photos[0] && <Img src={p.photos[0].src} alt="" sizes="120px" />}</div>
                  <div style={{ padding: "6px 8px", fontSize: 10 }}><b>{c.name}</b><br />{p.plans[0]?.name}</div>
                  <div className="a-btn">預約</div>
                </div>
                <span>LINE 卡片</span>
              </SoonButton>
            </div>
          </section>
        </div>

        <aside className={`ed-preview${preview ? " open" : ""}`} aria-label="學生看到的教練頁">
          <div className="ed-preview-top">
            <b>預覽：學生看到的樣子</b>
            <button className="btn btn-ghost btn-icon ed-preview-close" onClick={() => setPreview(false)} aria-label="關閉預覽"><Icon name="x" size={22} /></button>
          </div>
          <div className="pv-frame"><CoachPublicPage coach={c} preview /></div>
        </aside>
      </div>
      </ConsoleFrame>
      <CoachTabs active="page" />
    </>
  );
}

/** Free-form tags: remove with ×, add with Enter or the button. */
function TagEditor({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <fieldset className="ed-fs">
      <legend>{label}</legend>
      <div className="wrapchips">
        {values.map((v) => (
          <span key={v} className="tag tag-outline ed-tag">{v}<button type="button" aria-label={`移除 ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}><Icon name="x" size={12} stroke={2.4} /></button></span>
        ))}
      </div>
      <div className="ed-add-row">
        <input className="input" aria-label={`新增${label}`} value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" className="btn btn-secondary" onClick={add}>新增</button>
      </div>
    </fieldset>
  );
}
