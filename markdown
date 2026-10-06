# NONONICK — Digital Systems Studio

Static site. Zero dependencies, zero build step, zero Node required.

## Run locally
Double-click `index.html`, or serve the folder:
`python3 -m http.server 4173` → http://localhost:4173

## Structure
| Path | Role |
|---|---|
| `index.html` | Full experience: hero orb, services, system pipeline, work, doctrine, engine room, process, about, contact |
| `case-study.html?id=…` | Cinematic case files rendered from `js/data.js` |
| `css/core.css` | Tokens, reset, typography, utilities, FX overlays, reduced-motion contract |
| `css/components.css` | Nav, menu, orb dock, stage widget, dashboard, form, footer, case page |
| `css/sections.css` | Per-section compositions (hero → contact) |
| `js/utils.js` | Single RAF ticker, reveals, scramble, magnetic, tilt, parallax, counters, section tracking |
| `js/orb.js` | Canvas 3D-projected orb: point field, great-circle wire, rim light, satellites, reflection |
| `js/system.js` | Pipeline driver, process timeline, engine graph + live log |
| `js/data.js` | Case-study source of truth |
| `js/main.js` | Nav, services interaction, orb dock, contact transmission |

## Deploy
- **cPanel** — upload everything into `public_html/`. `.htaccess` handles compression, caching and headers.
- **GitHub Pages** — push the repo; no build step, paths are relative so project pages work.
- **Cloudflare Pages** — framework “None”, build command empty, output `/`.
- **Cloudflare Workers / Static Assets** — `wrangler deploy` with the folder as the assets binding.

Before going live: replace `nononick.com` in canonical/OG/JSON-LD/sitemap, point the form handler at your endpoint
(`js/main.js › brief()`), and swap social URLs.

## Performance & accessibility notes
- No raster imagery anywhere — every visual is CSS, SVG or Canvas. No autoplay video, no third-party scripts, no trackers.
- One shared `requestAnimationFrame` loop; all loops pause on tab-hide and when their section leaves the viewport.
- Canvas DPR capped at 1.6; point count reduced under 760 px.
- `prefers-reduced-motion` disables the orb loop (single static frame), parallax, tilt, magnetic travel, ticker, scramble
  and the live log — content renders complete.
- Semantic landmarks, visible focus rings, `aria-expanded` accordions, labelled fields with inline errors and a
  `role="log"` success state. Keyboard: `Esc` closes menu/accordion/dock, arrow keys roam the orb dock.