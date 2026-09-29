import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookScreen } from "@/features/coaches/BookScreen";
import { getCoach } from "@/lib/data/coaches";

export const metadata: Metadata = { title: "預約課程" };

export default async function Page({ params, searchParams }: PageProps<"/coaches/[id]/book">) {
  const { id } = await params;
  const { plan, with: w } = await searchParams;
  const c = getCoach(id);
  if (!c) notFound();
  const planId = typeof plan === "string" ? plan : c.profile.plans[0].id;
  return <BookScreen key={`${planId}-${w}`} coach={c} planId={planId} friends={w === "friends"} />;
}
