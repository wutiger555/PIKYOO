import { createClient } from "@supabase/supabase-js";
import { demoCalendar, liveCalendar, type BookingCalendar } from "@pikyoo/core/source/bookings";
import type { Booking, Coach, CoachProfile } from "@pikyoo/core/types";
import { isLive } from "./catalog";

/** The booking page's week (website: getBookingCalendar): mock seats in the demo, the coach's open sessions when live. */
export function loadCalendar(c: Coach): Promise<BookingCalendar> {
  if (!isLive) return Promise.resolve(demoCalendar(c));
  const sb = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  return liveCalendar(sb, c.id);
}

/** Per-person plans multiply by headcount (website: bookingTotal). */
export const bookingTotal = (b: Booking, p: CoachProfile) => {
  const plan = p.plans.find((x) => x.id === b.planId) ?? p.plans[0];
  return { plan, total: plan.price * (plan.unit === "/人" ? b.headcount : 1) };
};
