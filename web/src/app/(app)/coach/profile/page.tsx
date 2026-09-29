import type { Metadata } from "next";
import { CoachPageEditor } from "@/features/console/CoachPageEditor";

export const metadata: Metadata = { title: "我的教練頁" };

export default function Page() {
  return <CoachPageEditor />;
}
