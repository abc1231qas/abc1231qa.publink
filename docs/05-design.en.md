# 05 — Design

## Style in one line

**Eastern Zen minimalism**: heavy whitespace, low saturation, serif type, an ensō (zen circle) as the visual anchor.  
A deliberate shift from "modern tech" to "literary brand," aiming to **slow the reader down**.

## Palette (Ink & Gold)

| Use | Hex | Note |
|-----|-----|------|
| Background | `#F7F7F5` | Off-white, paper-like — pure white feels harsh |
| Primary stroke / dark text | `#2C2C2C` | Ink black |
| Headings | `#333333` | Slightly darker than body |
| Body text | `#595959` | Mid-gray, easier on long reads |
| Accent / hover | `#C5A065` | Muted antique gold — dividers, circles, interactive states |
| Hover background | `rgba(197,160,101,0.15)` | Faint gold wash |

> Rule: no pure white, no saturated colors. The whole site lives on three axes (rice / ink / gold) plus gray text.

## Typography

- **Chinese**: Noto Serif TC, falling back to PMingLiU.
- **English**: Times New Roman / Garamond / Baskerville.
- **No sans-serif**: it breaks the mood.

Hierarchy:

- h1 — `2.8rem` / `font-weight: 300` / `letter-spacing: 0.15em`
- Subhead — `1rem` / `letter-spacing: 0.3em`
- Body — `1.05rem` / `line-height: 2`

## Visual anchor: ensō

An incomplete circle, slightly rotated, with a gold glow at its center. Pure CSS — `border-radius: 50%`, set the top and right borders to `transparent`, then `transform: rotate(-15deg)`. The hand-drawn look comes from CSS, not an image asset.

## Layout

- Centered, symmetric. `max-width: 680px`.
- Whitespace ~**55%** of the viewport.
- 60–100px between sections.
- Body block capped at 480px wide (controls line length).

## Motion

- **Progressive fade-in** — elements appear one after another, not all at once.
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`.
- No bounces, no parallax, no hover-zoom. Restraint everywhere.

## Trade-off log

| Picked | Dropped | Why |
|--------|---------|-----|
| Off-white background | Pure white | Pure white is harsh on screens; off-white reads as paper |
| Serif | Sans-serif | Serif carries a literary, hand-crafted feel |
| Incomplete circle | Complete circle / logo | The ensō is *meant* to be incomplete |
| Thin-border buttons | Filled buttons | Filled buttons fight the whitespace |
| Progressive fade-in | Simultaneous / slide-in | Speed breaks the quiet |
| One muted gold | Multiple accent colors | Extra colors break the low-saturation rule |

## Screenshots

See [`../images/`](../images/): home / about / blog index, in desktop and mobile variants.

## Full design details

Full responsive rules, spacing tokens, and animation timings stay in the private repo. This page captures only the load-bearing decisions.
