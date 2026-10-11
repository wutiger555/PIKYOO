---
version: 1
slug: "docs-demo"
primary_target: "docs/demo"
related_targets: []
---

# docs/demo — 教練示範網站（Experience）

Scope: one standalone HTML page shown to pickleball coaches during interviews and shared as a link. Visitor mode: Experience. Audience: independent 雙北 pickleball coaches; the job is to make them want to be in the first batch. Proof: 27 real app screenshots (2026-10-10 simulator), the real TWQR transfer string. Constraints: PIKYOO's settled world (螢光球 × 碳纖維); say only what the product does today; demo data labelled 示範; no claim of permanent free.

## Direction contract

THESIS: A feature tour a coach can actually read: each feature gets its own section with a phone that plays that feature's screens like a short video, beside a numbered step list and the details. It refuses the previous version's scroll-hijacked pinned stage (rejected 2026-10-10: 太浮誇、不容易真正看到功能) and the card-grid brochure before it.

OWN-WORLD: Carbon stage (#0F110F; #1A1D1B + weave for active steps, the QR panel and the account stub), lime only on money and on the live step/tab (≤8% of a frame), #F2F3EF only on the phone screens. Barlow Condensed for display and every figure, Noto Sans TC for body. Ball-hole dots as tab and detail markers; story-style progress bars over each phone.

STORY: The hero states the offer and shows the QR payment with NT$600 landing in the coach's account. Sticky tabs (找到你・預約・收款・行事曆・上課・學生・你的頁面) let the coach jump to any feature; each section plays on its own and can be paused, stepped or clicked into. Ends at the lime first-batch invitation.

FIRST VIEWPORT: Brand top left; headline 「學生自己來預約，錢直接進你帳戶，你只管教球。」 left at clamp(40px,4.6vw,66px); two actions (看收款怎麼運作 primary, 從頭看每個功能); the payment-page phone right with one scan sweep and the carbon stub counting to +NT$600; the feature tab row at the fold.

FORM: Feature tour with per-section players; replaces 中央那支手機 (seed key 1485ab4e) at the owner's direction; code-led.

SIGNATURE INTERACTION: Each player autoplays only while on screen (3.6s per screen, progress bar fills), pauses for good once the viewer clicks a step or pause; step list and bars stay in sync; the real TWQR code fills in module by module when the payment section's QR panel comes into view. Reduced motion: no autoplay, crossfades only.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
