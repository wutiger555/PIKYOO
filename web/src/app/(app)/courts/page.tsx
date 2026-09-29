import type { Metadata } from "next";
import { CourtsScreen } from "@/features/courts/CourtsScreen";

export const metadata: Metadata = { title: "雙北匹克球場" };

export default function Page() {
  return <CourtsScreen />;
}
