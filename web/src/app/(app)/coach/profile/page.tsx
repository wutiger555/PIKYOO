import type { Metadata } from "next";
import { CoachProfileScreen } from "@/features/console/ConsoleScreens";

export const metadata: Metadata = { title: "我的招生頁" };

export default function Page() {
  return <CoachProfileScreen />;
}
