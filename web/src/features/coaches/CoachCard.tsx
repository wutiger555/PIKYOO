"use client";

import Link from "next/link";
import { Cred, LevelChip } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { useToast } from "@/components/pk/Toast";
import { useDemo } from "@/lib/demo-store";
import { money } from "@/lib/format";
import type { Coach } from "@/lib/types";

/** Carbon photo placeholder until coaches upload real photos. */
export function Photo({ coach, size }: { coach: Pick<Coach, "initial">; size?: "lg" | "sm" | "xs" }) {
  return (
    <div className={`photo${size ? " " + size : ""}`}>
      <span>{coach.initial}</span>
      <small>照片</small>
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

/** 標準化教練卡: every coach in the same format so price, level and credentials line up. */
export function CoachCard({ coach: c }: { coach: Coach }) {
  const { compare, setCompare } = useDemo();
  const toast = useToast();
  const on = compare.includes(c.id);
  const toggle = () => {
    if (on) setCompare((p) => p.filter((x) => x !== c.id));
    else if (compare.length < MAX_COMPARE) setCompare((p) => [...p, c.id]);
    else toast(`最多比較 ${MAX_COMPARE} 位`);
  };
  return (
    <article className="ccard">
      <Link className="ccard-top" href={`/coaches/${c.id}`}>
        <Photo coach={c} />
        <div className="ccard-main">
          <div className="ccard-name">
            {c.name}
            {c.rating != null && <Rating rating={c.rating} reviews={c.reviews} />}
          </div>
          <div className="ccard-creds">{c.creds.map((x, i) => <Cred key={i} c={x} />)}</div>
          <p className="ccard-tag">{c.tagline}</p>
        </div>
      </Link>
      <dl className="ccard-grid">
        <div><dt>程度</dt><dd><LevelChip min={c.levelMin} max={c.levelMax} /></dd></div>
        <div><dt>區域</dt><dd>{c.areas.join("・")}</dd></div>
        <div><dt>類型</dt><dd>{c.types.join("・")}</dd></div>
        <div><dt>起價</dt><dd className="num big">{money(c.priceFrom)}</dd></div>
      </dl>
      <div className="ccard-foot">
        <span className="next"><Icon name="clock" size={15} />最近可約 <b>{c.nextSlot}</b></span>
        <button className={`cmp${on ? " on" : ""}`} aria-pressed={on} onClick={toggle}>
          {on ? <Icon name="check" size={14} stroke={2.2} /> : <Icon name="plus" size={14} stroke={2} />}比較
        </button>
      </div>
    </article>
  );
}
