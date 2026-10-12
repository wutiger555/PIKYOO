import { isCertified } from "./data/coaches";
import type { Coach, Court, LessonType, Level } from "./types";

/** 找教練 (F3-3): "我是【程度】，想在【區域／場地】上【類型】" plus 已認證 / 新手友善. Shared by the website and the app. */
export interface CoachFilters {
  level: Level | null;
  type: LessonType | null;
  cert: boolean;
  beg: boolean;
  /** 行政區 without 區 (大安, 信義), as coaches store them; any of them matches */
  areas: string[];
  /** courts.id (slug): only coaches who teach there */
  courtId: string | null;
}

export const emptyCoachFilters = (): CoachFilters => ({ level: null, type: null, cert: false, beg: false, areas: [], courtId: null });

/** 大安區 → 大安: coaches store areas without 區, courts and profiles with it. */
export const area = (d: string) => d.replace(/區$/, "");

/** A coach's areas plus the districts of the courts they teach at, so a 大安 search finds a coach listed under 信義 who
 *  also teaches at 大安運動中心. */
export function coachAreas(c: Coach, courts: Court[]) {
  const set = new Set(c.areas.map(area));
  for (const v of c.profile.venues) {
    const ct = v.courtId && courts.find((x) => x.id === v.courtId);
    if (ct) set.add(area(ct.district));
  }
  return [...set];
}

export const teachesAt = (c: Coach, courtId: string) => c.profile.venues.some((v) => v.courtId === courtId);

export function filterCoaches(list: Coach[], f: CoachFilters, courts: Court[] = []) {
  return list.filter((c) => {
    if (f.level != null && (f.level < c.levelMin || f.level > c.levelMax)) return false;
    if (f.type && !c.types.includes(f.type)) return false;
    if (f.cert && !isCertified(c)) return false;
    if (f.beg && !c.beginnerFriendly) return false;
    if (f.courtId && !teachesAt(c, f.courtId)) return false;
    if (f.areas.length && !coachAreas(c, courts).some((a) => f.areas.includes(a))) return false;
    return true;
  });
}

/** One map pin per court that has coordinates and at least one of `list` teaching there. A coach with two courts shows
 *  on both. */
export interface CoachPin { court: Court & { lat: number; lng: number }; coaches: Coach[]; priceFrom: number }
export function coachPins(list: Coach[], courts: Court[]): CoachPin[] {
  return courts.flatMap((ct) => {
    if (ct.lat == null || ct.lng == null) return [];
    const coaches = list.filter((c) => teachesAt(c, ct.id));
    return coaches.length ? [{ court: ct as CoachPin["court"], coaches, priceFrom: Math.min(...coaches.map((c) => c.priceFrom)) }] : [];
  });
}

/** Coaches whose areas or courts aren't on the map (no linked court with coordinates). */
export const offMap = (list: Coach[], pins: CoachPin[]) => list.filter((c) => !pins.some((p) => p.coaches.includes(c)));
