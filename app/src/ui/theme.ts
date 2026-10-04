// PIKYOO tokens for the app: the same values as web/src/styles/tokens.css (docs/DESIGN_SYSTEM.md).

export const color = {
  bg: "#F2F3EF", surface: "#FFFFFF", text: "#121412", muted: "#5F645E", line: "#DFE1DA",
  accent: "#D4EE3A", accentSoft: "#F6FBDC", accent700: "#A9C11B", carbon: "#1A1D1B", onCarbonMuted: "#B9BEB6",
  n100: "#EBECE7", n200: "#DFE1DA", n300: "#CFD2CA", n500: "#8A8F88", n700: "#535852", n800: "#363A35",
  olive: "#4A513B", oliveSoft: "#EEF0E8", success: "#2E6A3F", successBg: "#E2EFE4", warning: "#875A00", warningBg: "#FBEFD3",
} as const;

/** 程度 ladder: 新手 … 4.5+, lightest to darkest olive. */
export const levelColor = ["#EEF0E8", "#D7DBCC", "#B8BEA9", "#949B82", "#6F775D", "#4A513B", "#1E221A"] as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24 } as const;
export const radius = { sm: 6, md: 10, lg: 16 } as const;

/** Times, prices and counts use Barlow Condensed like the website's `.num` (loaded in app/_layout.tsx). */
export const font = { num: "BarlowCondensed_600SemiBold", numBold: "BarlowCondensed_700Bold" } as const;

/** Demo photos live on the demo website (web/public/photos), so the app loads them from there. */
export const DEMO_SITE = "https://pikyoo-demo.vercel.app";
export const photo = (src: string) => (src.startsWith("http") ? src : `${DEMO_SITE}${src}`);
/** Bundled demo photos are stock photos of other players: tag them 示意照 (CLAUDE.md "Photos"). */
export const isStock = (src: string) => src.startsWith("/photos/");
