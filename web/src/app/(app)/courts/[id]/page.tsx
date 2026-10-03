import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourtDetailScreen } from "@/features/courts/CourtDetailScreen";
import { COURTS, getCourt } from "@pikyoo/core/data/courts";

export const generateStaticParams = () => COURTS.map((c) => ({ id: c.id }));

export async function generateMetadata({ params }: PageProps<"/courts/[id]">): Promise<Metadata> {
  const c = getCourt((await params).id);
  return c ? { title: `${c.name}匹克球場`, description: `${c.district}・${c.kind} ${c.courtCount} 面・${c.booking}。${c.address}` } : {};
}

export default async function Page({ params }: PageProps<"/courts/[id]">) {
  const c = getCourt((await params).id);
  if (!c) notFound();
  return <CourtDetailScreen court={c} />;
}
