import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourtDetailScreen } from "@/features/courts/CourtDetailScreen";
import { getCourt } from "@/lib/source";
import { JsonLd, SITE_URL } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/courts/[id]">): Promise<Metadata> {
  const c = await getCourt((await params).id);
  return c ? { title: `${c.name}匹克球場`, description: `${c.district}・${c.kind} ${c.courtCount} 面・${c.booking}。${c.address}`, alternates: { canonical: `/courts/${c.id}` } } : {};
}

export default async function Page({ params }: PageProps<"/courts/[id]">) {
  const c = await getCourt((await params).id);
  if (!c) notFound();
  const ld = {
    "@context": "https://schema.org", "@type": "SportsActivityLocation", name: `${c.name}匹克球場`, url: `${SITE_URL}/courts/${c.id}`,
    address: { "@type": "PostalAddress", streetAddress: c.address, addressLocality: c.district, addressCountry: "TW" },
    isAccessibleForFree: c.free, openingHours: c.hours || undefined,
  };
  return <><JsonLd data={ld} /><CourtDetailScreen court={c} /></>;
}
