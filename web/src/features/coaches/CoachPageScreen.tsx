"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Cred, LevelChip } from "@/components/pk/Badges";
import { Icon, type IconName } from "@/components/pk/Icon";
import { SoonButton } from "@/components/pk/Shell";
import { useToast } from "@/components/pk/Toast";
import { BOOKING_DAYS, slotsFor } from "@/lib/data/coaches";
import { useCoach } from "@/lib/demo-store";
import { levelText, money } from "@/lib/format";
import type { Coach, TimelineItem } from "@/lib/types";
import { Img, Rating } from "./CoachCard";

const TL_ICON: Record<TimelineItem["kind"], IconName> = { cert: "shield", trophy: "trophy", users: "users", cap: "cap" };
const SECTIONS = [["plans", "課程"], ["about", "關於我"], ["play", "匹克球檔案"], ["time", "可約時段"], ["exp", "經歷"], ["where", "地點"]] as const;

/** F3-4 教練頁（招生頁）. Reads the live coach so the console's edits show up here. */
export function CoachPageScreen({ coach }: { coach: Coach }) {
  const live = useCoach(coach.id) ?? coach;
  return <CoachPublicPage coach={live} />;
}

/** The public coach page; `preview` renders it inside the console editor (no navigation). */
export function CoachPublicPage({ coach: c, preview }: { coach: Coach; preview?: boolean }) {
  const p = c.profile;
  const toast = useToast();
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);
  const [cover, ...gallery] = p.photos;
  const groupPlan = p.plans.find((x) => x.group);
  const days = BOOKING_DAYS.map((d) => ({ d, slots: slotsFor(c, d) })).filter((x) => x.slots.length);
  const jump = (id: string) => {
    const t = scroller.current?.querySelector<HTMLElement>(`#a-${id}`);
    if (t && scroller.current) scroller.current.scrollTo({ top: t.offsetTop - 56, behavior: "smooth" });
  };
  const back = () => (window.history.length > 1 ? router.back() : router.push("/coaches"));
  const bookHref = (planId: string) => (preview ? "#" : `/coaches/${c.id}/book?plan=${planId}`);

  return (
    <>
      <div className="scroll" ref={scroller} style={{ paddingBottom: 16 }}>
        <div className="cover">
          {cover ? <Img src={cover.src} alt={cover.alt} sizes="480px" priority={!preview} /> : <div className="ph" style={{ position: "absolute", inset: 0, borderRadius: 0 }}>封面照片</div>}
          <div className="cover-bar">
            {!preview && <button className="rbtn" onClick={back} aria-label="返回"><Icon name="left" size={22} /></button>}
            <span style={{ flex: 1 }} />
            <button className="rbtn" onClick={() => toast("已收藏")} aria-label="收藏"><Icon name="heart" size={20} /></button>
            <button className="rbtn" onClick={() => toast(`分享教練頁到 LINE／複製 ${p.slug}`)} aria-label="分享"><Icon name="share" size={20} /></button>
          </div>
        </div>

        <div className="chero carbon">
          <div className="chero-name">
            <h1>{c.name}</h1>
            {c.rating != null && <span className="chero-rate"><Icon name="star" size={15} stroke={0} />{c.rating}<small>（{c.reviews}）</small></span>}
          </div>
          <div className="chero-sub">{c.areas.join("・")}・{p.reply}</div>
          <p className="chero-tag">{c.tagline}</p>
          <div className="chero-creds">{c.creds.map((x, i) => <Cred key={i} c={x} />)}</div>
          <div className="stats">
            <div><b className="num">{c.years}</b><span>年教學</span></div>
            <div><b className="num">{c.students}</b><span>位學生</span></div>
            <div><b className="num">{levelText(c.levelMin, c.levelMax)}</b><span>授課程度</span></div>
          </div>
        </div>

        {gallery.length > 0 && (
          <div className="gallery" aria-label="上課照片">
            {gallery.map((ph) => (
              <figure key={ph.src} className="gal">
                <div className="gal-img"><Img src={ph.src} alt={ph.alt} sizes="240px" /></div>
                {ph.caption && <figcaption>{ph.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}

        <nav className="anchors">
          {SECTIONS.map(([k, l]) => <button key={k} onClick={() => jump(k)}>{l}</button>)}
        </nav>

        <section className="blk" id="a-plans">
          <div className="blk-h"><h2>課程與價目</h2><LevelChip min={c.levelMin} max={c.levelMax} /></div>
          <div className="plans">
            {p.plans.map((pl) => (
              <Link key={pl.id} className="plan" href={bookHref(pl.id)}>
                <div className="plan-l">
                  <div className="plan-n">{pl.name}{pl.tag && <span className="tag tag-accent">{pl.tag}</span>}</div>
                  <div className="plan-m">{pl.durationMin} 分鐘・{pl.size}</div>
                  <div className="plan-note">{pl.note}</div>
                  {pl.group && <span className="plan-group"><Icon name="users" size={13} />可揪朋友一起上（{pl.group.min}–{pl.group.max} 人）</span>}
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

        {groupPlan?.group && (
          <div className="group-cta">
            <Icon name="users" size={22} />
            <div style={{ flex: 1 }}>
              <b>揪朋友一起上{groupPlan.name}</b>
              <p>找 {groupPlan.group.min - 1}–{groupPlan.group.max - 1} 位朋友，每人 {money(groupPlan.price)}，各自用自己的帳號加入、各自付款。</p>
            </div>
            <Link className="btn btn-secondary" style={{ minHeight: 40, padding: "0 14px" }} href={preview ? "#" : `/coaches/${c.id}/book?plan=${groupPlan.id}&with=friends`}>揪團</Link>
          </div>
        )}

        <section className="blk" id="a-about">
          <h2>關於我</h2>
          <p>{p.bio}</p>
          <h3 className="blk-sub">上課怎麼進行</h3>
          <ol className="howto">
            {p.steps.map((s, i) => <li key={i}><span className="num">{i + 1}</span>{s}</li>)}
          </ol>
          <div className="paytags" style={{ marginTop: 12 }}>{c.style.map((s) => <span key={s} className="tag tag-outline">{s}</span>)}</div>
          <h3 className="blk-sub">適合誰</h3>
          <ul className="fit">
            {p.audience.map((a) => <li key={a}><Icon name="check" size={16} stroke={2.2} />{a}</li>)}
          </ul>
        </section>

        <section className="blk" id="a-play">
          <h2>匹克球檔案</h2>
          <dl className="pbfile">
            <div><dt>球齡</dt><dd><b className="num">{Math.max(1, 2026 - Number(p.play.since))}</b> 年<small>（{p.play.since} 年開始）</small></dd></div>
            <div><dt>慣用手</dt><dd>{p.play.hand}</dd></div>
            <div><dt>打法</dt><dd>{p.play.format}</dd></div>
            <div><dt>運動背景</dt><dd>{p.play.background}</dd></div>
            <div><dt>DUPR</dt><dd>{(() => { const d = c.creds.find((x) => x.issuer === "DUPR"); return d ? <><b className="num">{d.level}</b> <small>{d.verified ? "已驗證" : "自填"}</small></> : <span className="text-muted">未提供</span>; })()}</dd></div>
            <div><dt>授課語言</dt><dd>{p.languages.join("・")}</dd></div>
          </dl>
          <h3 className="blk-sub">擅長教</h3>
          <div className="paytags">{p.play.strengths.map((s) => <span key={s} className="tag tag-accent-2">{s}</span>)}</div>
        </section>

        <section className="blk" id="a-time">
          <div className="blk-h"><h2>可約時段</h2><span className="text-muted" style={{ fontSize: 13 }}>未來 7 天</span></div>
          {days.length ? (
            <div className="avail">
              {days.map(({ d, slots }) => (
                <div key={d.key} className="avail-row">
                  <span className="avail-d"><b className="num">{d.date}</b><small>週{d.weekday}</small></span>
                  <div className="avail-s">
                    {slots.map(([t, left]) => (
                      <span key={t} className={`avail-t${left ? "" : " full"}`}>
                        <b className="num">{t}</b>{left ? `剩 ${left}` : "額滿"}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">這週還沒開放時段，可以先用 LINE 詢問。</p>
          )}
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
          {p.quotes.length ? (
            <div className="quotes">
              {p.quotes.map((q) => (
                <figure key={q.name} className="quote">
                  <blockquote>「{q.text}」</blockquote>
                  <figcaption>{q.name}・{q.level}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-muted">還沒有評價，上完課的學生可以留下第一則。</p>
          )}
        </section>

        <section className="blk" id="a-where" style={{ borderBottom: 0 }}>
          <h2>授課地點</h2>
          {p.venues.map((v) =>
            v.courtId && !preview ? (
              <Link key={v.name} className="row-item" href={`/courts/${v.courtId}`}>
                <span className="tl-i"><Icon name="pin" size={16} /></span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{v.name}</div><div className="text-muted" style={{ fontSize: 14 }}>{v.sub}</div></div>
                <Icon name="right" size={18} />
              </Link>
            ) : (
              <div key={v.name} className="row-item">
                <span className="tl-i"><Icon name="pin" size={16} /></span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{v.name}</div><div className="text-muted" style={{ fontSize: 14 }}>{v.sub}</div></div>
              </div>
            ),
          )}
          <SoonButton className="btn btn-secondary btn-block" style={{ marginTop: 12 }} msg={`開啟 LINE 聯絡 ${c.name}`}>
            <Icon name="msg" size={18} />先用 LINE 問問題
          </SoonButton>
        </section>
      </div>
      <div className="sticky-cta">
        <div className="sticky-cta-info">
          <span className="sticky-cta-sub">{p.plans.length} 種課程</span>
          <span className="sticky-cta-price">
            {money(c.priceFrom)}
            <small style={{ fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--color-on-carbon-muted)" }}> 起</small>
          </span>
        </div>
        {p.plans[0] && <Link className="btn btn-primary btn-lg" href={bookHref(p.plans[0].id)}>選時段預約</Link>}
      </div>
    </>
  );
}
