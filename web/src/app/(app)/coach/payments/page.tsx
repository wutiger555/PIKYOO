import type { Metadata } from "next";
import { CoachPaymentsScreen } from "@/features/console/ConsoleScreens";

export const metadata: Metadata = { title: "收款" };

export default function Page() {
  return <CoachPaymentsScreen />;
}
