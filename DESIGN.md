---
name: PIKYOO 匹友
description: 螢光球 × 碳纖維 — a mist-white reading surface, carbon-weave brand surfaces, and optic lime only where an action lands.
colors:
  mist: "#F2F3EF"
  surface: "#FFFFFF"
  carbon-ink: "#121412"
  grey-carbon: "#5F645E"
  hairline: "#DFE1DA"
  optic: "#D4EE3A"
  on-optic: "#121412"
  olive-carbon: "#4A513B"
  carbon: "#1A1D1B"
  on-carbon: "#FFFFFF"
  on-carbon-muted: "#B9BEB6"
  success: "#2E6A3F"
  success-bg: "#E2EFE4"
  warning: "#875A00"
  warning-bg: "#FBEFD3"
  danger: "#A8322A"
  danger-bg: "#F8E1DD"
  info: "#2F5D73"
  info-bg: "#E1EBF0"
typography:
  display:
    fontFamily: "Barlow Condensed, Noto Sans TC, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
  headline:
    fontFamily: "Barlow, Noto Sans TC, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Barlow, Noto Sans TC, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 900
    lineHeight: 1.15
  body:
    fontFamily: "Barlow, Noto Sans TC, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  num:
    fontFamily: "Barlow Condensed, Noto Sans TC, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.01em"
  label:
    fontFamily: "Barlow, Noto Sans TC, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1
rounded:
  sm: "6px"
  md: "10px"
  lg: "20px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.optic}"
    textColor: "{colors.on-optic}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "#DBF15E"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.full}"
    padding: "0 12px"
    height: "48px"
  button-ink:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.mist}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-lg:
    padding: "0 32px"
    height: "56px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  chip-selected:
    backgroundColor: "{colors.carbon-ink}"
    textColor: "{colors.on-carbon}"
    rounded: "{rounded.full}"
    padding: "0 16px 0 8px"
    height: "40px"
  tag-accent:
    backgroundColor: "{colors.optic}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.sm}"
    padding: "5px 8px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  tab-active:
    backgroundColor: "{colors.optic}"
    textColor: "{colors.on-optic}"
    rounded: "24px"
    height: "52px"
  sticky-cta:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.on-carbon}"
    padding: "12px 16px"
  ticket-stub:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.on-carbon}"
    padding: "12px"
    width: "92px"
---

# Design System: PIKYOO 匹友

<!-- Scan mode, 2026-10-10. Source of truth: web/src/styles/tokens.css (tokens), web/src/styles/pikyoo.css (component classes), docs/DESIGN_SYSTEM.md (prose). The frontmatter above is normative; prose explains where and why. Qualitative language (north star, color names, character) is DERIVED from DESIGN_SYSTEM.md's 「螢光球 × 碳纖維」 concept and BRAND_DESIGN_BRIEF.md §1.1, not confirmed with the owner. -->

## Overview

**Creative North Star: "The Scoreboard on the Kitchen Line"** *(derived, not confirmed)*

PIKYOO looks like the court it serves: a quiet mist-white reading surface, a carbon-fibre stub where the brand holds the ticket, and one optic-lime ball that appears only where something can happen right now. Pickleball needs a holed ball and a paddle and nothing else; the system is built from those two objects. Numbers (times, prices, levels, seats) are set large in Barlow Condensed like a scoreboard; Chinese copy sits beneath in Noto Sans TC at a reading size and reading line-height, because a large share of players are middle-aged and the phone is held one-handed at courtside.

The world is deliberately restrained. Lime is a fill, never a text colour on light; its area stays under 8% of any screen and a screen has one primary lime button at most. Carbon surfaces (ticket stubs, the floating tab bar, the sticky CTA, share cards) carry a diagonal weave so brand surfaces read as material, not as "dark mode". Everything else is flat white on mist with hairlines. The brief's personality table rules out the Tailwind-default orange/blue/green/teal/purple of every local competitor, cartoon friendliness, glaring neon, and enterprise-SaaS coldness; this palette is the answer to that table.

**Key Characteristics:**
- Three materials: mist (reading), white (cards and tickets), carbon weave (brand).
- Optic lime is an action signal: fill only, ≤8% of a screen, one primary button per screen.
- Numbers are display type: Barlow Condensed, tabular, large; Chinese text is body type at 16px / 1.6.
- Ball-hole geometry everywhere: pill buttons, chips, seats, the perforated ticket edge, the lit ball on a selected chip.
- Flat by default; the only shadows are the primary button's hard offset and the lift under floating shells (tab bar, sheet, dialog).
- Phone first, 44px tap targets, primary actions at the bottom.

## Colors

A near-monochrome carbon/mist system with a single acid accent, plus an olive-carbon family reserved for the skill-level scale.

### Primary
- **Optic (螢光球)** (`optic`): the fill of the one thing you can act on now: the primary button, your seat, today, 「缺 N」, the selected tab, the selected radio dot, the focus ring on inputs. Always carries `on-optic` (carbon ink) text. Never used as text or a thin line on mist or white; the only lime text in the system is the `.en` scoreboard label when it sits on carbon.

### Secondary
- **Olive carbon (橄欖碳)** (`olive-carbon`): the 7-step level scale (新手 · 2.0 … 4.5+), one hue from `#EEF0E8` to `#1E221A`, drawn as bars of rising height inside the level badge. The number is always printed beside the bars. Also a quiet tag tint (`accent-2-100` / `accent-2-800`) and the third seat colour.

### Neutral
- **Mist (霧白)** (`mist`): page background; the reading surface.
- **Surface (白)** (`surface`): cards, tickets, chips, inputs, the level and credential badges.
- **Carbon ink (碳黑)** (`carbon-ink`): all text, the logo, borders on the primary and secondary button, the selected chip and segment, the ink button, the kitchen-line rule, focus outlines on light surfaces.
- **Grey carbon (灰碳)** (`grey-carbon`): secondary text, captions, table headers; 5.4:1 on mist.
- **Hairline (線)** (`hairline`): card and ticket borders, row dividers, the app bar's bottom edge.
- **Carbon (碳纖維)** (`carbon`) + the weave: ticket stubs, the tab bar, the sticky CTA, the home greeting, LINE/share cards. Text on it is `on-carbon` (white) or `on-carbon-muted`.
- A 9-step neutral ramp (`neutral-100` … `neutral-900`) supplies button borders (300), disabled states (200/400/600), hover tints (100/200), and dark seats (600/800). See the sidecar.

### Status
- **Success / Warning / Danger / Info** with their `-bg` pairs: game and booking status pills (`.status-open/-almost/-full/-ended/-info`) and the credential "verified" tick. Always paired with a word; the pill carries a 6px dot of its own colour and the text.

### Named Rules
**The Fill-Only Rule.** Optic lime is a background, never a glyph. Text, icons, and hairlines on mist or white are carbon ink; the lime surface carries carbon-ink text.
**The 8% Rule.** Lime covers at most 8% of any screen and a screen has one primary lime button. Its rarity is what makes it mean "now".
**The Weave Rule.** A carbon surface is `carbon` plus the `--carbon-weave` diagonal stripe, never a flat dark fill. A full game (`.ticket.is-full`) drops to flat `neutral-600` with no weave: the weave means live.

## Typography

**Display / Numeric Font:** Barlow Condensed (with Noto Sans TC fallback), weights 500–800 loaded
**Body Font:** Barlow (with Noto Sans TC, then system-ui), weights 400–700 loaded; CJK glyphs fall through to Noto Sans TC (400/500/700/900)
**Label Font:** same stacks; no mono except the `.ph` placeholder caption

**Character:** A scoreboard pairing. Latin numerals are tall, condensed and tabular; Chinese prose is calm, generous and heavy at the top of a section. The contrast is size and width, not family count.

### Hierarchy
- **Display** (Barlow Condensed 700, 32px / 1, tabular): the ticket-stub start time; 44px in the large ticket. Prices use the same face at 20px (ticket fee) and 26px (sticky CTA).
- **Headline** (Barlow 700, 28px / 1.3): page `h1`. `h2` 22px, `h3` 18px, `h4` 16px.
- **Title** (Barlow/Noto 900, 24px / 1.15): the section head `.sec-head h2`; the one place weight 900 appears.
- **Body** (Barlow/Noto 400, 16px / 1.6): all reading copy; 16px is the floor. Card body and dialog body may drop to 14–15px.
- **Num** (`.num`, Barlow Condensed 600, tabular, 0.01em): any inline time, price, level or seat count, at the surrounding size.
- **Label** (Barlow 700, 13px / 1): tags, status pills, credential badges, ticket day, tab captions (12px). Field labels are 14px / 500.
- **Scoreboard eyebrow** (`.en`, Barlow Condensed 800, 13px, 0.14em, uppercase, grey carbon; lime on carbon): an incumbent device that sits directly above a section title. It exists in the system today; it is not a pattern to add to new surfaces that do not already use `.sec-head`.

### Named Rules
**The Tabular Rule.** Every time, price, level and seat count is set in Barlow Condensed with tabular figures so columns of numbers align and large numbers read at a glance.
**The 16/44 Rule.** Body text never drops below 16px and no tap target below 44px (buttons 48, large buttons 56). Players skew older; this is not negotiable.

## Layout

Phone first. Screens are a vertical stack inside a scroller; primary actions live at the bottom in a carbon sticky CTA or the floating carbon tab bar, both padded for the safe area. Spacing is an 8pt grid with a 4px half-step (`--space-1` 4 … `--space-12` 48); cards pad 16, rows are at least 56px tall, section heads sit on a 12px bottom margin.

Breakpoints: tablet (640–1023px) is the phone layout widened to a 720px column; desktop is ≥1024px and opt-in per screen (`.dk` on the scroller), where a top nav and breadcrumbs replace the tab bar and app bar, a `.dk-narrow` column centres at 760px, and bottom CTAs float. The phone layout must not change when desktop work is done. Content density is moderate: one ticket or card per row on the phone, lists separated by hairlines rather than gaps.

## Elevation & Depth

Flat by default with tonal layering: white cards and tickets sit on mist with a 1px hairline, and the carbon weave gives brand surfaces their own depth without a shadow. Shadows have two jobs only: the primary button's hard carbon offset (a pressable, paddle-like edge that sinks on press) and a soft lift under shells that float over the page (tab bar, sheet, dialog, toast). Shadows are tinted carbon ink via `color-mix`, never pure black.

### Shadow Vocabulary
- **Hard press** (`box-shadow: 0 4px 0 var(--color-text)`; `0 1px 0` on `:active` with `translateY(3px)`): the primary button only. On carbon surfaces the offset becomes `accent-800` so it still reads.
- **Hairline lift** (`--shadow-sm`, `0 1px 2px` ink 8%): the switch knob.
- **Card lift** (`--shadow-md`, `0 6px 18px` ink 10%): toasts and the optional `.elev-md` card.
- **Shell lift** (`--shadow-lg`, `0 18px 44px` ink 22%): the floating tab bar, bottom sheets, dialogs.

### Named Rules
**The One Hard Shadow Rule.** The hard 0 4px 0 offset belongs to the primary button and nothing else. Cards, chips and tickets are flat.

## Shapes

Two silhouettes: the ball and the ticket. Anything you press is a pill (`full`, 999px): buttons, chips, seats, status pills, the segmented control, the switch, the tab bar's 30px capsule. Anything you read is a soft rectangle: tags, level and credential badges at 6px; cards, tickets, inputs and placeholders at 10px; sheets and dialogs at 20px. Borders are 1px hairline on cards, 1.5–2px carbon ink on interactive outlines (buttons, chips, the credential badge). Three recurring motifs: the ball hole (radial dots: the ticket's perforated edge, the lit ball on a selected chip, the concave open seat), the carbon ticket stub (a left-hand carbon panel holding the time), and the kitchen line (`.court-rule`: a 2px ink rule with two short ticks at 32% and 68%).

## Components

### Buttons
Tactile and confident: pill-shaped, bold 16–17px, 48px tall, 2px outline.
- **Shape:** full pill (999px); 48px min height, 56px for `.btn-lg`; 44px square for `.btn-icon`.
- **Primary:** optic fill, carbon-ink text and 2px border, hard 0 4px 0 ink offset; 17px bold. One per screen.
- **Hover / Active:** hover lightens to `accent-400`; active sinks 3px and the offset drops to 1px. Disabled keeps the shape but turns grey (`neutral-200` fill, `neutral-600` text, `neutral-400` offset).
- **Secondary:** white fill, carbon-ink border and text; hover `neutral-100`. On carbon: transparent with a 55% white border.
- **Ghost:** no border, 12px side padding, hover a 6% ink tint.
- **Ink:** carbon-ink fill, mist text; used for waitlist. On carbon it inverts to white.

### Chips
- **Style:** white pill, 1.5px `neutral-300` border, 15px bold, 40px tall; hover darkens the border to ink. Chips sit in a horizontal scroller with hidden scrollbars.
- **Selected (`aria-pressed`):** carbon-ink fill, white text, and a 20px lime ball with ink-dark holes appears at the left edge.

### Tags and Status
- **Tag:** 13px, 5px 8px padding, 6px radius. `tag-accent` is optic with bold ink text; `tag-accent-2` olive tint; `tag-neutral` grey; `tag-outline` a 1px ink border.
- **Status pill:** full pill, 13px bold, status colour text on its `-bg`, 6px leading dot.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** white on mist; 1px hairline border; 16px padding; 8px internal gap.
- **Shadow Strategy:** none by default (see Elevation).
- **Rows:** `.row-item` 56px min height, hairline between rows, none after the last.

### Inputs / Fields
- **Style:** white, 1px `neutral-300` border, 10px radius, 44px min height, 16px text; label above at 14px / 500.
- **Focus:** border turns ink and a 3px optic outline hugs the field (offset 0).
- **Radio / Segmented / Switch:** the radio dot fills optic with a white inset ring when checked; the segmented control is a mist pill whose selected option is carbon ink; the switch is a 48×28 pill whose knob turns optic when on.

### Navigation
- **Tab bar (phone):** a floating carbon-weave capsule (30px radius, shell lift shadow, 10px side margins, safe-area bottom). Tabs are 12px bold, muted white; the current tab is an optic pill (24px) with ink text and a heavier icon stroke.
- **App bar (phone):** 52px, mist, hairline bottom; centred 17px bold title.
- **Top nav (desktop):** mist with a hairline bottom; brand in Barlow Condensed 22px; links 15px, current link underlined by a 3px `accent-600` inset.
- **Sheet / Dialog:** mist, 20px radius (top corners only for the sheet), shell lift, 40×4 grey grip; backdrop 50% ink.

### Ticket (signature)
The game and lesson card. A 92px carbon-weave stub on the left holds the day (13px bold) and the start time (Barlow Condensed 700, 32px) with the end time muted; a column of radial white dots perforates the stub's right edge; the white body holds venue (17px bold), district (13px muted), tags with the fee pushed right (Condensed 600, 20px), and a hairline-topped foot with the seat row. `.ticket-lg` widens the stub to 116px and the time to 44px. A full game loses the weave.

### Seats (signature)
22px balls (34px in `.seats-lg`): dark carbon, grey and olive for taken seats; the host ringed in ink; an open seat is a concave mist hole (inset shadow); your seat is optic with an ink ring; the waitlist is a white outlined pill. Always accompanied by the words 「缺 N」.

### Level badge (signature)
A white 6px-radius badge, 26px tall, holding seven 3px bars that rise from 5px to 14px, lit in the olive-carbon ramp up to the player's level, with the number printed in Barlow Condensed 600 beside them.

### Credential badge
A 1px ink-bordered 6px box: issuer block in ink with white bold text, level, and a green verified state. Self-reported credentials switch to a dashed grey border and a grey issuer block.

## Do's and Don'ts

### Do:
- **Do** put exactly one optic primary button on a screen and keep lime under 8% of the frame.
- **Do** set every time, price, level and seat count in Barlow Condensed with tabular figures, larger than the surrounding text.
- **Do** build carbon surfaces as `carbon` + `--carbon-weave`; text on them is white or `on-carbon-muted`.
- **Do** use the pill for anything pressable and 6 / 10 / 20px for tags / cards / sheets; do not invent radii between them.
- **Do** keep body text at 16px and tap targets at 44px or more.
- **Do** pair every status colour with a word; colour alone never carries state.
- **Do** write copy like a 球友: 「週六缺 2，來嗎？」.

### Don't:
- **Don't** use optic lime as text, icon or hairline colour on mist or white.
- **Don't** use Tailwind default colours, or orange, blue, green, teal or purple as a primary.
- **Don't** add hard offset shadows to anything but the primary button; cards, chips and tickets are flat.
- **Don't** use thick-stroke icons (the set is 1.75 stroke with filled ball-hole dots) or icons without a text label.
- **Don't** rotate, outline, texture, or add a second ball to the logo.
- **Don't** change the phone layout when adding desktop rules; desktop is opt-in per screen at ≥1024px.
