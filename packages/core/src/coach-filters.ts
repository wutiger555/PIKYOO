import { isCertified } from "./data/coaches";
import type { Coach, LessonType, Level } from "./types";

/** 找教練 (F3-3): "我是【程度】，想上【類型】" plus 已認證 / 新手友善. Shared by the website and the app. */
export interface CoachFilters {
  level: Level | null;
  type: LessonType | null;
  cert: boolean;
  beg: boolean;
}

export const emptyCoachFilters = (): CoachFilters => ({ level: null, type: null, cert: false, beg: false });

export function filterCoaches(list: Coach[], f: CoachFilters) {
  return list.filter((c) => {
    if (f.level != null && (f.level < c.levelMin || f.level > c.levelMax)) return false;
    if (f.type && !c.types.includes(f.type)) return false;
    if (f.cert && !isCertified(c)) return false;
    if (f.beg && !c.beginnerFriendly) return false;
    return true;
  });
}
