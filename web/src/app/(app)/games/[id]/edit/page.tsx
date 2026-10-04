import type { Metadata } from "next";
import { EditGameScreen } from "@/features/host/EditGameScreen";

export const metadata: Metadata = { title: "編輯球局" };

export default async function Page({ params }: PageProps<"/games/[id]/edit">) {
  return <EditGameScreen id={(await params).id} />;
}
