import type { Metadata } from "next";
import { GroupInviteScreen } from "@/features/groups/GroupInviteScreen";

export const metadata: Metadata = { title: "朋友邀你一起上課" };

export default async function Page({ params }: PageProps<"/groups/[id]/invite">) {
  return <GroupInviteScreen id={(await params).id} />;
}
