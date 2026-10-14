"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Cred, LevelChip } from "@/components/pk/Badges";
import { Crumbs } from "@/components/pk/Crumbs";
import { Icon, type IconName } from "@/components/pk/Icon";
import { LoginSheet } from "@/components/pk/LoginSheet";
import { useToast } from "@/components/pk/Toast";
import { TopNav } from "@/components/pk/TopNav";
import { bookingDays, isCertified, slotsFor } from "@pikyoo/core/data/coaches";
import { CANCEL_TEXT, specialties } from "@pikyoo/core/rules";
import { useCoach, useDemo } from "@/lib/demo-store";
import { money } from "@pikyoo/core/format";
import type { Coach, TimelineItem } from "@pikyoo/core/types";
import { BookCard } from "./BookCard";
import { Img, Rating } from "./CoachCard";
import { AskSheet, QuestionBoard } from "./QuestionBoard";

const TL_ICON: Record<TimelineItem["kind"], IconName> = { cert: "shield", trophy: "trophy", users: "users", cap: "cap" };

// Order (2026-10-15, after the coach interview): trust first (reviews, credentials), then what to buy (plans,
// times), then the person, questions and where. The app's coach page follows the same order.
type SectionKey = "reviews" | "creds" | "plans" | "time" | "about" | "qa" | "where";
const SECTIONS: [SectionKey, string, string][] = [
  ["reviews", "評價", "學生評價"], ["creds", "資格", "資格與經歷"], ["plans", "課程", "課程與價目"], ["time", "時段", "可約時段"],
  ["about", "關於我", "關於我"], ["qa", "問與答", "問與答"], ["where", "地點", "授課地點"],
];
/** What a visitor sees before signing in; every other section sits behind the sign-in panel. Search engines and IG
 *  visitors still get the photos, credentials, prices and bio. Widen or narrow the gate here. */
const GUEST_SECTIONS: ReadonlySet<SectionKey> = new Set(["creds", "plans", "about"]);

/** F3-4 教練頁（招生頁）. Reads the live coach so the console's edits show up here. */
export function CoachPageScreen({ coach }: { coach: Coach }) {
  const live = useCoach(coach.id) ?? coach;
  return <CoachPublicPage coach={live} />;
}

/** The public coach page; `preview` renders it inside the console editor (no navigation, no desktop layout, never locked).
 *  At ≥1024px (`.dk`) it becomes the desktop page: top nav, photo mosaic, content left, sticky BookCard right. */
export function CoachPublicPage({ coach: c, preview }: { coach: Coach; preview?: boolean }) {
  const p = c.profile;
  const toast = useToast();
  const router = useRouter();
  const { signedIn } = useDemo();
  const scroller = useRef<HTMLDivElement>(null);
  const [asking, setAsking] = useState(false);
  const [login, setLogin] = useState<string | null>(null);
  const locked = !preview && !signedIn;
  const shows = (k: SectionKey) => !locked || GUEST_SECTIONS.has(k);
  const hidden = SECTIONS.filter(([k]) => !shows(k)).map(([, , title]) => title);
  const [cover, ...gallery] = p.photos;
  const tiles = gallery.slice(0, 2);
  const groupPlan = p.plans.find((x) => x.group);
  const days = bookingDays().map((d) => ({ d, slots: slotsFor(c, d) })).filter((x) => x.slots.length);
  /** Scrolls the phone scroller, or the window on the desktop page (where the scroller doesn't scroll). */
  const jump = (id: string) => {
    const el = scroller.current;
    const t = el?.querySelector<HTMLElement>(`#a-${id}`);
    if (!el || !t) return;
    const bar = el.querySelector<HTMLElement>(".anchors")?.offsetHeight ?? 52;
    if (el.scrollHeight > el.clientHeight + 1) el.scrollTo({ top: t.offsetTop - bar - 4, behavior: "smooth" });
    else {
      const nav = el.querySelector<HTMLElement>(".topnav")?.offsetHeight ?? 0;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - nav - bar - 8, behavior: "smooth" });
    }
  };
  const back = () => (window.history.length > 1 ? router.back() : router.push("/coaches"));
  const bookHref = (planId: string) => (preview ? "#" : `/coaches/${c.id}/book?plan=${planId}`);
  const askLogin = () => setLogin(`登入後可以預約 ${c.name} 的課`);

  return (
    <>
      <div className={`scroll cp${preview ? "" : " dk"}`} ref={scroller} style={{ paddingBottom: 16 }}>
        {!preview && <TopNav active="coaches" />}
        {!preview && <Crumbs items={[["首頁", "/"], ["找教練", "/coaches"], [c.name]]} />}

        <div className={`cp-media n${tiles.length}`}>
          <div className="cover">
            {cover ? <Img src={cover.src} alt={cover.alt} sizes="(min-width: 1024px) 800px, 480px" priority={!preview} /> : <div className="ph" style={{ position: "absolute", inset: 0, borderRadius: 0 }}>封面照片</div>}
            <div className="cover-bar">
              {!preview && <button className="rbtn mb-only" onClick={back} aria-label="返回"><Icon name="left" size={22} /></button>}
              <span style={{ flex: 1 }} />
              <button className="rbtn" onClick={() => toast("已收藏")} aria-label="收藏"><Icon name="heart" size={20} /></button>
              <button className="rbtn" onClick={() => toast(`分享教練頁到 LINE／複製 ${p.slug}`)} aria-label="分享"><Icon name="share" size={20} /></button>
            </div>
          </div>
          {!preview && tiles.map((ph) => (
            <div key={ph.src} className="cp-tile dk-only"><Img src={ph.src} alt={ph.alt} sizes="400px" /></div>
          ))}
        </div>

        <div className="cp-cols">
          <div className="cp-main">
            <div className="chero carbon">
              <div className="chero-name"><h1>{c.name}</h1></div>
              {isCertified(c) && <div className="chero-cert"><Icon name="check" size={14} stroke={2.6} />已認證教練</div>}
              <div className="stats">
                <div><b className="num">{c.rating != null ? `★ ${c.rating}` : "—"}</b><span>{c.reviews ? `${c.reviews} 則評價` : "還沒有評價"}</span></div>
                <div><b className="num">{c.students}</b><span>位學生上過課</span></div>
                <div><b className="num">{c.years}</b><span>年教學</span></div>
              </div>
              <p className="chero-tag">{c.tagline}</p>
              {specialties(c).length > 0 && <div className="chero-spec" aria-label="教學專長">{specialties(c).map((x) => <span key={x}>{x}</span>)}</div>}
            </div>

            <nav className="anchors">
              {SECTIONS.filter(([k]) => shows(k)).map(([k, l]) => <button key={k} onClick={() => jump(k)}>{l}</button>)}
              {locked && <button className="anchor-lock" onClick={() => jump("locked")}><Icon name="lock" size={15} />登入看更多</button>}
            </nav>

            {shows("reviews") && (
              <section className="blk" id="a-reviews">
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
            )}

            <section className="blk" id="a-creds">
              <h2>資格與經歷</h2>
              <div className="chero-creds">{c.creds.map((x, i) => <Cred key={i} c={x} />)}</div>
              {!locked && (
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
              )}
            </section>

            <section className="blk" id="a-plans">
              <div className="blk-h"><h2>課程與價目</h2><LevelChip min={c.levelMin} max={c.levelMax} /></div>
              <div className="plans">
                {p.plans.map((pl) => {
                  const body = (
                    <>
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
                    </>
                  );
                  return locked
                    ? <button key={pl.id} className="plan" onClick={askLogin}>{body}</button>
                    : <Link key={pl.id} className="plan" href={bookHref(pl.id)}>{body}</Link>;
                })}
              </div>
              <dl className="kv-sm">
                <dt>取消</dt><dd>{CANCEL_TEXT}<small className="text-muted">（平台統一規則）</small></dd>
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
                {locked
                  ? <button className="btn btn-secondary" style={{ minHeight: 40, padding: "0 14px" }} onClick={askLogin}>揪團</button>
                  : <Link className="btn btn-secondary" style={{ minHeight: 40, padding: "0 14px" }} href={preview ? "#" : `/coaches/${c.id}/book?plan=${groupPlan.id}&with=friends`}>揪團</Link>}
              </div>
            )}

            {shows("time") && (
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
                  <p className="text-muted">這週還沒開放時段，可以先在<button className="linkbtn" onClick={() => jump("qa")}>問與答</button>問教練。</p>
                )}
            <section className="blk" id="a-about">
              <h2>關於我</h2>
              <p>{p.bio}</p>
              <h3 className="blk-sub">上課怎麼進行</h3>
              <ol className="howto">
                {p.steps.map((s, i) => <li key={i}><span className="num">{i + 1}</span>{s}</li>)}
              </ol>
              <h3 className="blk-sub">適合誰</h3>
              <ul className="fit">
                {p.audience.map((a) => <li key={a}><Icon name="check" size={16} stroke={2.2} />{a}</li>)}
              </ul>
              {!locked && (
                <>
                  <h3 className="blk-sub">匹克球檔案</h3>
                  <dl className="pbfile">
                    <div><dt>球齡</dt><dd><b className="num">{Math.max(1, 2026 - Number(p.play.since))}</b> 年</dd></div>
                    <div><dt>打法</dt><dd>{p.play.format}</dd></div>
                    <div><dt>運動背景</dt><dd>{p.play.background}</dd></div>
                    <div><dt>授課語言</dt><dd>{p.languages.join("・")}</dd></div>
                  </dl>
                </>
              )}
              {gallery.length > 0 && (
                <>
                  <h3 className="blk-sub">上課照片</h3>
                  <div className="gallery" aria-label="上課照片">
                    {gallery.map((ph) => (
                      <figure key={ph.src} className="gal">
                        <div className="gal-img"><Img src={ph.src} alt={ph.alt} sizes="240px" /></div>
                        {ph.caption && <figcaption>{ph.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                </>
              )}
            </section>


              </section>
            )}

            {shows("qa") && <QuestionBoard coach={c} onAsk={preview ? undefined : () => setAsking(true)} />}

            {shows("where") && (
              <section className="blk" id="a-where" style={{ borderBottom: 0 }}>
                <div className="blk-h"><h2>授課地點</h2><span className="text-muted" style={{ fontSize: 13 }}>{c.areas.join("・")}</span></div>
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
              </section>
            )}

            {locked && (
              <section className="blk lockpanel" id="a-locked">
                <div className="lock-ghost" aria-hidden="true"><i /><i /><i /><i /></div>
                <div className="lock-box">
                  <span className="lock-ic"><Icon name="lock" size={22} /></span>
                  <h2>登入看完整教練頁</h2>
                  <p>還有 {hidden.join("、")}。</p>
                  <button className="btn btn-primary btn-lg" onClick={() => setLogin(`登入後可以看 ${c.name} 的完整教練頁`)}>用 LINE 登入／註冊</button>
                  <p className="fine">免費，第一次登入就會自動建立帳號。</p>
                </div>
              </section>
            )}
          </div>

          {!preview && (
            <aside className="cp-aside dk-only" aria-label="預約">
              <BookCard coach={c} locked={locked} onLogin={askLogin} />
            </aside>
          )}
        </div>
      </div>
      <div className="sticky-cta">
        <div className="sticky-cta-info">
          <span className="sticky-cta-sub">{p.plans.length} 種課程</span>
          <span className="sticky-cta-price">
            {money(c.priceFrom)}
            <small style={{ fontSize: 14, fontFamily: "var(--font-body)", fontWeight: 500, color: "var(--color-on-carbon-muted)" }}> 起</small>
          </span>
        </div>
        {p.plans[0] && (locked
          ? <button className="btn btn-primary btn-lg" onClick={askLogin}>登入後預約</button>
          : <Link className="btn btn-primary btn-lg" href={bookHref(p.plans[0].id)}>選時段預約</Link>)}
      </div>
      {asking && <AskSheet coach={c} onClose={() => setAsking(false)} onSent={() => jump("qa")} />}
      {login && <LoginSheet onClose={() => setLogin(null)} reason={login} />}
    </>
  );
}
