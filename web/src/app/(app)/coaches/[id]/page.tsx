import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoachPageScreen } from "@/features/coaches/CoachPageScreen";
import { getCoach } from "@/lib/source";
import { JsonLd, SITE_URL } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/coaches/[id]">): Promise<Metadata> {
  const c = await getCoach((await params).id);
  return c ? { title: `${c.name} 教練`, description: c.tagline, alternates: { canonical: `/coaches/${c.id}` } } : {};
}

export default async function Page({ params }: PageProps<"/coaches/[id]">) {
  const c = await getCoach((await params).id);
  if (!c) notFound();
  const ld = {
    "@context": "https://schema.org", "@type": "Person", name: c.name, jobTitle: "匹克球教練", description: c.tagline,
    url: `${SITE_URL}/coaches/${c.id}`, areaServed: c.areas,
    makesOffer: c.profile.plans.map((p) => ({ "@type": "Offer", name: p.name, price: p.price, priceCurrency: "TWD", description: p.note || undefined })),
  };
  return <><JsonLd data={ld} /><CoachPageScreen coach={c} /></>;
}
