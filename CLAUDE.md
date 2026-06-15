# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Bruno Mello, a Senior iOS Engineer. It's a static site hosted on GitHub Pages at `brunocerberus.github.io`. The design language is **GRAPHITE AURORA** — a dark-first visionOS / Spatial-Glass aesthetic.

## Tech Stack

- **HTML5** - Single page (`index.html`)
- **CSS3** - Custom styles with CSS variables for theming (`css/style.css`)
- **Vanilla JavaScript** - Interactive features and the motion engine (`js/main.js`)
- **No build system** - Static files served directly
- **Fonts (Google Fonts):** Bricolage Grotesque (display), Hanken Grotesk (body), Geist Mono (mono). Do NOT reintroduce Inter/Roboto/system display fonts.
- **Font Awesome 6** (CDN) for icons.

## Development

Open `index.html` directly in a browser or use any local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

## Deployment

Push to `master` branch - GitHub Pages auto-deploys from the root directory.

## Architecture

### Design System: GRAPHITE AURORA

A graphite void lit by one slow "breathing" aurora, with content floating as sheets of frosted glass.

**Color law (do not violate):** exactly ONE cold accent (`--accent` #7FB2FF) + ONE warm ember (`--ember` #FFB37A). Saturated color is reserved for glow / strokes / focus rings / display numerals only — never reading copy. Ember is rationed to ~5% of surface (current-role beacon, the single `.stat--ember` tile, primary CTA, footer). Reading text uses `--text-primary` / `--text-muted` (WCAG-AA verified over glass); `--text-faint` is decorative-only (hairlines, inactive icons).

### Theming System
- Two themes: **dark is the default** (`:root, [data-theme="dark"]`), **light is a porcelain twin** (`[data-theme="light"]`). Never pure white.
- Theme is set **before paint** by an inline `<head>` script (also adds the `js` class), persisted via `localStorage`, and toggled in `js/main.js` (updates `aria-pressed` + `<meta name="theme-color">`).
- Depth is a 5-rung z-ladder of opaque planes: `--void-floor` → `--canvas` → `--plane-mid` → `--plane-raised` → `--plane-near`. Every glass pane sits over a named plane so contrast holds even if `backdrop-filter` fails.

### Key CSS Patterns
- **Glass material:** base `.glass` (specular bevel via inset shadows) + three blur tiers `.glass--thin` / `.glass--card` / `.glass--thick`. `.glass-well` is a recessed inset surface (logos, form inputs). An `@supports not (backdrop-filter)` block provides solid fallbacks.
- **Spatial environment:** a single fixed `.env` layer behind everything — `.env-void` gradient, `.env-aurora` orbs, `.env-stars`, `.env-grain`, `.env-vignette`, and a `.cursor-light` orb that refracts through the glass.
- **Continuous-corner radii** (`--r-chip` … `--r-hero`) and an 8pt spacing scale (`--s1` … `--s11`).
- **Named easings:** `--ease-glass`, `--ease-emphatic`, `--spring-soft`, etc.
- **Responsive breakpoints:** 1024px, 768px, 480px.

### JavaScript Features (`js/main.js`, single IIFE)
- **Dirty-driven rAF loop** — idles when nothing moves; re-kicked by scroll / pointermove / resize / visibility. Keep layout reads (`getBoundingClientRect`, the timeline pour, `scrollHeight`) inside the scroll-gated branch, never every frame.
- **Cursor-as-light-source:** a lerped `.cursor-light` orb + `.cursor-halo` ring (fine pointers only).
- **Pointer tilt with internal depth:** `[data-tilt]` cards tilt toward the cursor; `.tz` children (`data-tz`) lift via `translateZ`.
- **Magnetic CTAs** (`[data-magnetic]`), **rack-focus** (`data-focus-group` → hovered sharpens, siblings get `.is-dimmed`).
- **Scroll-linked timeline pour:** `#timelineFill` height + `.tl-item.lit`; current role is `.is-now` (ember beacon).
- **Reveal on scroll:** `.reveal` / `.reveal-left` / `.reveal-right` / `.reveal-scale` → `.is-in` via `IntersectionObserver` (staggered by `data-d`).
- Stats counter, FLIP nav pill, role typewriter, "Lens Calibration" loader, contact-form validation.

### Accessibility & graceful degradation
- A pre-paint **`js` class** on `<html>` gates hidden-by-default states (reveal/loader/hero lines) so the page is fully readable with JS disabled.
- `cursor: none` is gated behind `.pointer-active` (added on first real pointer move), so the native cursor survives JS failure, the pre-move state, and reduced motion.
- `prefers-reduced-motion` disables ALL ambient motion (orbs, breathing, timeline pour, typewriter, parallax, cursor) and restores the native cursor; counters jump to final values.
- `@media (hover: none)` / coarse pointers disable the custom cursor, tilt, and magnetic pull.
- WCAG-AA contrast, `:focus-visible` rings, a skip link, real `<nav>` with `aria-current="page"`, and labeled form fields with `aria-invalid` on error.

### Mobile Considerations
- `overflow-x: hidden` on both `html` and `body` is a backstop, not a fix — iOS Safari can still pan to off-viewport content. The real safeguard is to keep nothing wider than the viewport (see the reveal-transform gotchas). Safe-area insets respected on the fixed nav/footer.
- Navigation collapses to a hamburger menu at 768px (frosted dropdown; Escape closes and restores focus to the toggle).
- Backdrop-filter de-escalation on mobile: thick/card blur reduced, and small `.chip` surfaces drop `backdrop-filter` entirely to save GPU/battery.

## Gotchas
- **Gradient-clipped text** (`background-clip: text`): override the gradient with `background-image:`, NOT the `background` shorthand — the shorthand silently resets `background-clip` to `border-box` and the text renders as a solid block.
- **`[data-tilt]` cards must keep `overflow: visible`** — any non-visible overflow collapses `transform-style: preserve-3d` and kills the internal `translateZ` depth.
- **Reveal `.is-in` must out-specify the hidden states.** The hidden states are `.js .reveal*` (specificity 0,2,0); a bare `.is-in` (0,1,0) loses, so the `transform` never resets and elements stay frozen at their initial offset. Reset with a matching-specificity selector (`.js .reveal*.is-in`), **not `!important`** — the pointer-tilt engine writes inline transforms on `[data-tilt]` reveal cards (stats/skills/projects/edu) and an `!important` rule would clobber them.
- **`.reveal-left` / `.reveal-right` translate horizontally** (`translateX(±48px)`), which overflows the viewport once the container padding is smaller than the offset. They're verticalized to `translateY` at ≤1024px (where the location/contact grids stack). If you add a horizontal reveal to a near-full-width element, verticalize it on mobile too.
- **Grid items need `min-width: 0` to shrink below content.** A `1fr` track is `minmax(auto, 1fr)`; its `auto` floor is the item's min-content, so an item with an unbreakable row (e.g. icon + email) forces the track wider than the viewport on narrow screens. Set `min-width: 0` on the grid item (see `.contact-info`).
- **A filtered iframe ignores an ancestor's rounded clip.** The map iframe paints on its own compositing layer (its `filter` forces this), so `overflow: hidden` plus `border-radius` on `.map-window` never clips its corners and the bottom two render square. Round and clip the iframe's direct wrapper (`.map-frame`) instead, with the radius set to the panel radius minus the 1px window border so it nests inside the frame.
