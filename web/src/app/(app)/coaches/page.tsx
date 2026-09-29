import type { Metadata } from "next";
import { FindCoachesScreen } from "@/features/coaches/FindCoachesScreen";

export const metadata: Metadata = { title: "找教練" };

export default function Page() {
  return <FindCoachesScreen />;
}
