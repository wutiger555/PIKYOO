import type { Metadata } from "next";
import { DesignNav } from "./DesignNav";

export const metadata: Metadata = {
  title: { default: "Design System", template: "%s｜PIKYOO Design" },
  robots: { index: false },
};

export default function DesignLayout({ children }: LayoutProps<"/design">) {
  return (
    <>
      <DesignNav />
      {children}
    </>
  );
}
