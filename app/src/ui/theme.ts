// PIKYOO tokens for the app: the same values as web/src/styles/tokens.css (docs/DESIGN_SYSTEM.md).

export const color = {
  bg: "#F2F3EF", surface: "#FFFFFF", text: "#121412", muted: "#5F645E", line: "#DFE1DA",
  accent: "#D4EE3A", accentSoft: "#F6FBDC", carbon: "#1A1D1B", onCarbonMuted: "#B9BEB6",
} as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24 } as const;

/** Demo photos live on the demo website (web/public/photos), so the app loads them from there. */
export const DEMO_SITE = "https://pikyoo-demo.vercel.app";
export const photo = (src: string) => (src.startsWith("http") ? src : `${DEMO_SITE}${src}`);
