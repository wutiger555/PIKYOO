"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Cred, LevelChip } from "@/components/pk/Badges";
import { Icon, type IconName } from "@/components/pk/Icon";
import { AppBar, SoonButton } from "@/components/pk/Shell";
import { useToast } from "@/components/pk/Toast";
import { money } from "@/lib/format";
import type { Coach, CoachProfile, TimelineItem } from "@/lib/types";
import { Photo, Rating } from "./CoachCard";

const TL_ICON: Record<TimelineItem["kind"], IconName> = { cert: "shield", trophy: "trophy", users: "users", cap: "cap" };

/** F3-4 教練頁（招生頁）: carbon hero, anchors, price list, teaching method, timeline, reviews, venues, sticky CTA. */
export function CoachPageScreen({ coach: c }: { coach: Coach }) {
  if (!c.profile) return <CoachLite coach={c} />;
  return <CoachFull coach={c} p={c.profile} />;
}

function CoachFull({ coach: c, p }: { coach: Coach; p: CoachProfile }) {
  const toast = useToast();
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);
  const jump = (id: string) => {
    const t = scroller.current?.querySelector<HTMLElement>(`#a-${id}`);
    if (t && scroller.current) scroller.current.scrollTo({ top: t.offsetTop - 56, behavior: "smooth" });
  };
  const back = () => (window.history.length > 1 ? router.back() : router.push("/coaches"));

  return (
    <>
      <div className="scroll" ref={scroller} style={{ paddingBottom: 16 }}>
        <div className="chero carbon">
          <div className="chero-bar">
            <button className="rbtn" onClick={back} aria-label="返回"><Icon name="left" size={22} /></button>
            <span style={{ flex: 1 }} />
            <button className="rbtn" onClick={() => toast("已收藏")} aria-label="收藏"><Icon name="heart" size={20} /></button>
            <button className="rbtn" onClick={() => toast(`分享教練頁到 LINE／複製 ${p.slug}`)} aria-label="分享"><Icon name="share" size={20} /></button>
          </div>
          <div className="chero-body">
            <Photo coach={c} size="lg" />
            <div style={{ minWidth: 0 }}>
              <h1>{c.name}</h1>
              <div className="chero-sub">{c.areas.join("・")}・{p.reply}</div>
            </div>
          </div>
          <p className="chero-tag">{c.tagline}</p>
          <div className="chero-creds">{c.creds.map((x, i) => <Cred key={i} c={x} />)}</div>
          <div className="stats">
            <div><b className="num">{c.years}</b><span>年教學</span></div>
            <div><b className="num">{c.students}</b><span>位學生</span></div>
            <div><b className="num">{c.rating ?? "—"}</b><span>{c.reviews} 則評價</span></div>
          </div>
        </div>

        <nav className="anchors">
          {([["plans", "課程與價目"], ["about", "教學方式"], ["exp", "經歷"], ["where", "地點"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => jump(k)}>{l}</button>
          ))}
        </nav>

        <section className="blk" id="a-plans">
          <div className="blk-h"><h2>課程與價目</h2><LevelChip min={c.levelMin} max={c.levelMax} /></div>
          <div className="plans">
            {p.plans.map((pl) => (
              <Link key={pl.id} className="plan" href={`/coaches/${c.id}/book?plan=${pl.id}`}>
                <div className="plan-l">
                  <div className="plan-n">{pl.name}{pl.tag && <span className="tag tag-accent">{pl.tag}</span>}</div>
                  <div className="plan-m">{pl.durationMin} 分鐘・{pl.size}</div>
                  <div className="plan-note">{pl.note}</div>
                </div>
                <div className="plan-r">
                  <span className="num plan-p">{money(pl.price)}</span>
                  <small>{pl.unit}</small>
                </div>
              </Link>
            ))}
          </div>
          <dl className="kv-sm">
            <dt>取消</dt><dd>{p.policy}</dd>
            <dt>付款</dt>
            <dd>
              <div className="paytags">{p.pay.map((x) => <span key={x} className="tag tag-neutral">{x}</span>)}</div>
              <span className="text-muted" style={{ fontSize: 13 }}>教練確認預約後再付款</span>
            </dd>
          </dl>
        </section>

        <section className="blk" id="a-about">
          <h2>教學方式</h2>
          <p>{p.bio}</p>
          <ol className="howto">
            {p.steps.map((s, i) => <li key={i}><span className="num">{i + 1}</span>{s}</li>)}
          </ol>
          <div className="paytags" style={{ marginTop: 12 }}>{c.style.map((s) => <span key={s} className="tag tag-outline">{s}</span>)}</div>
        </section>

        <section className="blk" id="a-exp">
          <h2>經歷與資格</h2>
          <ul className="tl">
            {p.timeline.map((t) => (
              <li key={t.year + t.text}>
                <span className="tl-y num">{t.year}</span>
                <span className="tl-i"><Icon name={TL_ICON[t.kind]} size={16} /></span>
                <span className="tl-t">
                  {t.text}
                  {t.kind === "cert" && <span className="vf"><Icon name="check" size={12} stroke={2.4} />PIKYOO 已查驗</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="blk">
          <div className="blk-h"><h2>學生怎麼說</h2>{c.rating != null && <Rating rating={c.rating} reviews={c.reviews} big />}</div>
          <div className="quotes">
            {p.quotes.map((q) => (
              <figure key={q.name} className="quote">
                <blockquote>「{q.text}」</blockquote>
                <figcaption>{q.name}・{q.level}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="blk" id="a-where" style={{ borderBottom: 0 }}>
          <h2>授課地點</h2>
          {p.venues.map((v) => (
            <SoonButton key={v.name} className="row-item" msg="球場詳情（下一輪）">
              <span className="tl-i"><Icon name="pin" size={16} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{v.name}</div>
                <div className="text-muted" style={{ fontSize: 14 }}>{v.sub}</div>
              </div>
              <Icon name="right" size={18} />
            </SoonButton>
          ))}
          <SoonButton className="btn btn-secondary btn-block" style={{ marginTop: 12 }} msg={`開啟 LINE 聯絡 ${c.name}`}>
            <Icon name="msg" size={18} />先用 LINE 問問題
          </SoonButton>
        </section>
      </div>
      <div className="sticky-cta">
        <div className="sticky-cta-info">
          <span className="sticky-cta-sub">體驗課</span>
          <span className="sticky-cta-price">
            {money(c.priceFrom)}
            <small style={{ fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--color-on-carbon-muted)" }}> 起</small>
          </span>
        </div>
        <Link className="btn btn-primary btn-lg" href={`/coaches/${c.id}/book?plan=${p.plans[0].id}`}>選時段預約</Link>
      </div>
    </>
  );
}

/** Other coaches share the same template; only Mia's full page is filled in for the MVP demo. */
function CoachLite({ coach: c }: { coach: Coach }) {
  return (
    <>
      <AppBar title={c.name} back="/coaches" historyBack />
      <div className="scroll">
        <div className="empty-s" style={{ paddingTop: 64 }}>
          <h3>Demo 只做了 Mia 教練的完整頁面</h3>
          <p className="text-muted">所有教練頁都用同一個版型。</p>
          <Link className="btn btn-primary" href="/coaches/mia">看 Mia 的教練頁</Link>
        </div>
      </div>
    </>
  );
}
