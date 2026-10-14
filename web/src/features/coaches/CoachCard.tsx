"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { LevelChip } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { useToast } from "@/components/pk/Toast";
import { useDemo } from "@/lib/demo-store";
import { isCertified } from "@pikyoo/core/data/coaches";
import { levelText, money } from "@pikyoo/core/format";
import { specialties } from "@pikyoo/core/rules";
import type { Coach, CoachProfile } from "@pikyoo/core/types";

/** A photo filling its (position: relative) parent. The demo's bundled photos (/photos/…) are free stock photos
 *  (docs/PHOTOS.md), not the coaches themselves, so they carry the「示意照」tag; a coach's own uploads (Storage URLs, or
 *  blob: before saving) don't.
 *  A missing file shows `fallback`. */
export function Img({ src, alt, sizes, priority, demo = src.startsWith("/photos/"), fallback }: { src: string; alt: string; sizes: string; priority?: boolean; demo?: boolean; fallback?: React.ReactNode }) {
  const [st, setSt] = useState<{ src: string; ok: boolean } | null>(null);
  const status = st?.src === src ? (st.ok ? "ok" : "err") : "loading";
  // An image that finished (or failed) before hydration fires no event; read its state when the node attaches.
  const onRef = useCallback((el: HTMLImageElement | null) => { if (el?.complete) setSt({ src, ok: el.naturalWidth > 0 }); }, [src]);
  if (status === "err") return <>{fallback ?? <div className="ph img-ph" role="img" aria-label={alt}>照片</div>}</>;
  return (
    <>
      <Image ref={onRef} src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={src.startsWith("blob:")} style={{ objectFit: "cover" }} onLoad={() => setSt({ src, ok: true })} onError={() => setSt({ src, ok: false })} />
      {demo && status === "ok" && <DemoTag />}
    </>
  );
}

/** The demo photos are stock photos of other players; say so wherever one is shown large. */
function DemoTag() {
  return <span className="demo-tag">示意照</span>;
}

/** Coach's cover photo, or the carbon initial placeholder until one is uploaded. */
export function Photo({ coach, size }: { coach: Pick<Coach, "initial" | "name"> & { profile?: Pick<CoachProfile, "photos"> }; size?: "lg" | "sm" | "xs" }) {
  const cover = coach.profile?.photos[0];
  return (
    <div className={`photo${size ? " " + size : ""}`}>
      {cover ? (
        <Img src={cover.src} alt={coach.name} sizes="100px" demo={false} fallback={<span>{coach.initial}</span>} />
      ) : (
        <>
          <span>{coach.initial}</span>
          <small>照片</small>
        </>
      )}
    </div>
  );
}

export function Rating({ rating, reviews, big }: { rating: number; reviews: number; big?: boolean }) {
  return (
    <span className={`rate${big ? " big" : ""}`}>
      <Icon name="star" size={big ? 16 : 13} stroke={0} />
      <b>{rating}</b>
      <span>{big ? `${reviews} 則` : `(${reviews})`}</span>
    </span>
  );
}

export const MAX_COMPARE = 3;

/** 標準化教練卡, trimmed after the 2026-10-14 interview: photo, name, verified, rating and students, specialties, where
 *  and what level, price and the next free slot. Credentials, tagline and plans are one click away on the coach page. */
export function CoachCard({ coach: c }: { coach: Coach }) {
  const { compare, setCompare } = useDemo();
  const toast = useToast();
  const on = compare.includes(c.id);
  const cover = c.profile.photos[0];
  const spec = specialties(c);
  const toggle = () => {
    if (on) setCompare((p) => p.filter((x) => x !== c.id));
    else if (compare.length < MAX_COMPARE) setCompare((p) => [...p, c.id]);
    else toast(`最多比較 ${MAX_COMPARE} 位`);
  };
  return (
    <article className="ccard">
      <Link className="ccard-link" href={`/coaches/${c.id}`}>
        <div className="ccard-photo">
          {cover ? <Img src={cover.src} alt={cover.alt} sizes="(max-width: 480px) 100vw, 448px" /> : <div className="ph" style={{ position: "absolute", inset: 0, borderRadius: 0 }}>教練照片</div>}
          {c.beginnerFriendly && <span className="ccard-flag"><Icon name="sprout" size={14} stroke={1.8} />新手友善</span>}
        </div>
        <div className="ccard-top">
          <div className="ccard-main">
            <div className="ccard-name">{c.name}{isCertified(c) && <span className="ccard-ok" title="已認證教練"><Icon name="check" size={14} stroke={2.6} /></span>}</div>
            <div className="ccard-trust">{c.rating != null ? <><b>★ {c.rating}</b>（{c.reviews}）</> : "還沒有評價"}・{c.students} 位學生</div>
            {spec.length > 0 && <span className="ccard-spec">{spec.map((x) => <span key={x}>{x}</span>)}</span>}
            <div className="ccard-meta">{c.areas.join("・")}・{levelText(c.levelMin, c.levelMax)}</div>
          </div>
          <div className="ccard-price">
            <b className="num">{money(c.priceFrom)}</b>
            <small>起</small>
          </div>
        </div>
      </Link>
      <div className="ccard-foot">
        <span className="next"><Icon name="clock" size={15} />最近可約 <b>{c.nextSlot}</b></span>
        <button className={`cmp${on ? " on" : ""}`} aria-pressed={on} onClick={toggle}>
          {on ? <Icon name="check" size={14} stroke={2.2} /> : <Icon name="plus" size={14} stroke={2} />}比較
        </button>
      </div>
    </article>
  );
}

/** Photo-first mini card for horizontal rails (首頁推薦教練). */
export function CoachMini({ coach: c }: { coach: Coach }) {
  const cover = c.profile.photos[0];
  const cred = c.creds.find((x) => x.verified && x.issuer !== "DUPR") ?? c.creds[0];
  return (
    <Link href={`/coaches/${c.id}`} className="cmini">
      <div className="cmini-photo">
        {cover ? <Img src={cover.src} alt={cover.alt} sizes="200px" /> : <div className="ph" style={{ position: "absolute", inset: 0, borderRadius: 0 }}>照片</div>}
      </div>
      <div className="cmini-body">
        <b>{c.name}</b>
        {cred && <span className="text-muted" style={{ fontSize: 12 }}>{cred.issuer} {cred.level}</span>}
        <span className="cmini-row">
          <LevelChip min={c.levelMin} max={c.levelMax} />
          <span className="num cmini-p">{money(c.priceFrom)}<small> 起</small></span>
        </span>
      </div>
    </Link>
  );
}
