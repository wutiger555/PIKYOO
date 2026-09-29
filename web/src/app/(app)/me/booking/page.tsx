import type { Metadata } from "next";
import { BookingStatusScreen } from "@/features/coaches/BookingStatusScreen";
import type { BookingStatus } from "@/lib/types";

export const metadata: Metadata = { title: "我的預約" };

const DEMO_STATES: BookingStatus[] = ["pending", "confirmed", "reported", "paid"];

export default async function Page({ searchParams }: PageProps<"/me/booking">) {
  const { demo } = await searchParams;
  const state = DEMO_STATES.find((s) => s === demo);
  return <BookingStatusScreen demo={state} />;
}
