import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoachPageScreen } from "@/features/coaches/CoachPageScreen";
import { COACHES, getCoach } from "@pikyoo/core/data/coaches";

export const generateStaticParams = () => COACHES.map((c) => ({ id: c.id }));

export async function generateMetadata({ params }: PageProps<"/coaches/[id]">): Promise<Metadata> {
  const c = getCoach((await params).id);
  return c ? { title: `${c.name} 教練`, description: c.tagline } : {};
}

export default async function Page({ params }: PageProps<"/coaches/[id]">) {
  const c = getCoach((await params).id);
  if (!c) notFound();
  return <CoachPageScreen coach={c} />;
}
