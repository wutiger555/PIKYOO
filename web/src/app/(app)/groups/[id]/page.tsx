import type { Metadata } from "next";
import { GroupScreen } from "@/features/groups/GroupScreen";

export const metadata: Metadata = { title: "揪朋友一起上" };

// Groups live in the client demo store until Supabase; the page only passes the id through.
export default async function Page({ params }: PageProps<"/groups/[id]">) {
  return <GroupScreen id={(await params).id} />;
}
