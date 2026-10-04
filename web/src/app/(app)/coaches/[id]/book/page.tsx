import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookScreen } from "@/features/coaches/BookScreen";
import { getBookingCalendar, getCoach } from "@/lib/source";

export const metadata: Metadata = { title: "預約課程" };

export default async function Page({ params, searchParams }: PageProps<"/coaches/[id]/book">) {
  const { id } = await params;
  const { plan, with: w, day, slot } = await searchParams;
  const c = await getCoach(id);
  if (!c) notFound();
  const planId = typeof plan === "string" ? plan : c.profile.plans[0].id;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  return <BookScreen key={`${planId}-${w}-${day}-${slot}`} coach={c} planId={planId} friends={w === "friends"} dayKey={str(day)} slot={str(slot)} calendar={await getBookingCalendar(c)} />;
}
