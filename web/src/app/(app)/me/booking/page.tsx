import type { Metadata } from "next";
import { myBookings } from "@pikyoo/core/source/bookings";
import { myPayment } from "@pikyoo/core/source/payments";
import { BookingStatusScreen } from "@/features/coaches/BookingStatusScreen";
import { getMe, supabaseServer } from "@/lib/supabase";
import type { BookingStatus } from "@pikyoo/core/types";

export const metadata: Metadata = { title: "我的預約" };

const DEMO_STATES: BookingStatus[] = ["pending", "confirmed", "reported", "paid"];

export default async function Page({ searchParams }: PageProps<"/me/booking">) {
  const { demo, id } = await searchParams;
  const me = await getMe();
  if (me === undefined) return <BookingStatusScreen demo={DEMO_STATES.find((s) => s === demo)} />;
  // real sign-in: the booking asked for, else the next one still open
  const list = me ? await myBookings(await supabaseServer(), me.id) : [];
  const live = list.find((x) => x.id === id) ?? [...list].reverse().find((x) => x.state === "pending" || x.state === "confirmed") ?? null;
  const payment = me && live?.state === "confirmed" ? await myPayment(await supabaseServer(), live.id, me.id) : null;
  return <BookingStatusScreen live={live} payment={payment} />;
}
