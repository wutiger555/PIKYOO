import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameDetailScreen } from "@/features/games/GameDetailScreen";
import { HostedGameDetail } from "@/features/games/HostedGameDetail";
import { getGame } from "@/lib/source";
import { JsonLd, SITE_URL } from "@/lib/site";
import { levelText } from "@pikyoo/core/format";

export async function generateMetadata({ params }: PageProps<"/games/[id]">): Promise<Metadata> {
  const g = await getGame((await params).id);
  if (!g) return {};
  const title = `${g.dayLabel} ${g.startsAt} ${g.venue}`;
  const spots = g.capacity - g.participants.length;
  // what LINE shows under the preview image (opengraph-image.tsx)
  const description = `${g.date} ${g.startsAt}–${g.endsAt}・程度 ${levelText(g.levelMin, g.levelMax)}・每人 NT$${g.fee}・${spots > 0 ? `缺 ${spots}` : "額滿可候補"}`;
  return { title, description, alternates: { canonical: `/games/${g.id}` }, openGraph: { title: `${title}｜PIKYOO 匹友`, description } };
}

export default async function Page({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const g = await getGame(id);
  // ids starting with "h" are games opened in this browser session (開團); they exist only client-side
  if (!g) return id.startsWith("h") ? <HostedGameDetail id={id} /> : notFound();
  // live day groups are Taipei dates (YYYY-MM-DD); the demo's (today, sat …) are never indexed
  const day = /^\d{4}-\d{2}-\d{2}$/.test(g.group) ? g.group : null;
  const ld = day && {
    "@context": "https://schema.org", "@type": "SportsEvent", sport: "Pickleball", name: `${g.venue} 匹克球局`, url: `${SITE_URL}/games/${g.id}`,
    startDate: `${day}T${g.startsAt}:00+08:00`, endDate: `${day}T${g.endsAt}:00+08:00`,
    location: { "@type": "Place", name: g.venue, address: g.address },
    organizer: { "@type": "Person", name: g.host.name },
    offers: { "@type": "Offer", price: g.fee, priceCurrency: "TWD", availability: `https://schema.org/${g.participants.length < g.capacity ? "InStock" : "SoldOut"}` },
  };
  return <>{ld && <JsonLd data={ld} />}<GameDetailScreen game={g} /></>;
}
