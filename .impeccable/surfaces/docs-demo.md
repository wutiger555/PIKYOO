---
version: 1
slug: "docs-demo"
primary_target: "docs/demo"
related_targets: []
---

# docs/demo — 教練示範網站（Experience）

Scope: one standalone HTML page shown to pickleball coaches during interviews and shared as a link. Visitor mode: Experience. Audience: independent 雙北 pickleball coaches; the job is to make them want to be in the first batch. Proof: 27 real app screenshots (2026-10-10 simulator), the real TWQR transfer string. Constraints: PIKYOO's settled world (螢光球 × 碳纖維); say only what the product does today; demo data labelled 示範; no claim of permanent free.

## Direction contract

THESIS: One phone, pinned at the exact center of the viewport the whole way down; the page scrolls, the phone never does. It refuses the catalog of phone-in-card sections the previous version shipped and the stacked-feature-grid every coaching-tool page uses.

OWN-WORLD: Carbon ground (#0F110F / #1A1D1B with the weave), 螢光球 #D4EE3A only where money moves or an action lands (≤8% of any frame), 霧白 #F2F3EF reserved for the phone screen itself. Barlow Condensed 600/700 for every number and the display line; Noto Sans TC 400/700 for Chinese body. Ball-hole dots as progress markers; the carbon ticket stub (`.ticket`) as the coach's account; one court-rule hairline per chapter break. Recognizable with all copy removed: a dark stage, one white phone, lime in motion.

STORY: A coach lands mid-scan: a student's bank app is reading the QR on the phone and NT$600 is leaving the student for the coach's own account. They understand in three seconds that money skips the platform. Scrolling, they see how the student got there (found the coach, booked a slot), then live the coach's own day on the same phone (calendar, roster, roll call, on-court QR, reconciliation). They end at a lime invitation to be in the first batch.

FIRST VIEWPORT: No nav, no title bar. The phone (390×844 aspect, ~44vh tall on desktop) centered; its screen shows the real payment page (09-pay-qr). A lime scan line sweeps the QR region once on load. Left of the phone, Barlow Condensed display 「錢直接進你的帳戶」 at ~clamp(44px,6vw,88px), two lines. Right of the phone, a carbon ticket stub reading 「台新 812 ・ 林＊亞」 with a lime 「+NT$600」 that animates in as the scan completes (counter 0→600 over 900ms, ease-out expo). Below the fold edge, a single ball-hole dot row (one dot per chapter) and the word 往下.

FORM: 中央那支手機, candidate 3 of my 7 ranked structures; seed key 1485ab4e; code-led. Raises: live-generated QR from the real TWQR string, modules drawn one by one (Jacquard); the whole page radiates from the single scan event (particle detector); phone width collapses the pinned phone into a sticky top strip with vertical reading order (tensegrity).

SIGNATURE INTERACTION: Scroll position drives the phone's screen (a crossfade with 1px blur between captured screens) and the chapter copy; the three full-bleed moments (the QR assembling itself to fill the viewport, 「已收到 NT$600」 flooding lime, the week calendar) take over the stage while the phone recedes to 60% and dims. Tapping or pressing → advances one beat without scrolling.

MOTION GRAMMAR: ease-out expo cubic-bezier(.16,1,.3,1); 240ms for screen swaps, 600–900ms for the three authored beats; reduced-motion keeps crossfades and counters, removes sweeps and parallax.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
