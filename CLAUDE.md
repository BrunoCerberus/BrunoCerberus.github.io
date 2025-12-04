# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Bruno Mello, a Senior iOS Developer. It's a static site hosted on GitHub Pages at `brunocerberus.github.io`.

## Tech Stack

- **HTML5** - Single page (`index.html`)
- **CSS3** - Custom styles with CSS variables for theming (`css/style.css`)
- **Vanilla JavaScript** - Interactive features and animations (`js/main.js`)
- **No build system** - Static files served directly

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

### Theming System
- CSS variables defined in `:root` (light) and `[data-theme="dark"]` (dark)
- Theme persisted via `localStorage`
- Toggle handled in `js/main.js`

### Key CSS Patterns
- Glassmorphism: `var(--glass-bg)` with `backdrop-filter: blur()`
- Gradient backgrounds: `var(--gradient-primary)`, `var(--gradient-mesh)`
- Responsive breakpoints: 1024px, 768px, 480px

### JavaScript Features
- Custom cursor (hidden on touch devices via `@media (hover: none)`)
- Scroll-triggered reveal animations using `IntersectionObserver`
- 3D tilt effects on cards
- Stats counter animation
- Mobile menu with hamburger toggle

### Mobile Considerations
- `overflow-x: hidden` on both `html` and `body` prevents horizontal scroll issues on iOS
- Custom cursor is disabled on touch devices
- Navigation collapses to hamburger menu at 768px
