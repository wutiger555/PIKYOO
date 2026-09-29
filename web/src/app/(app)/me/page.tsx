import type { Metadata } from "next";
import { MeScreen } from "@/features/me/MeScreen";

export const metadata: Metadata = { title: "我的" };

export default function Page() {
  return <MeScreen />;
}
