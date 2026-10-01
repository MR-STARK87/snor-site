# Snor-site — landing site for Snor

Static site. No build step — open `index.html` directly or serve the folder.

## Deployment

Published on GitHub Pages from `main` (root). The custom domain
**https://snor.is-a.dev/** is set by the `CNAME` file at the repo root, which must
contain exactly `snor.is-a.dev` with no scheme, path or trailing spaces.

The `is-a.dev` DNS record (`CNAME` → `mr-stark87.github.io`) lives in the
`is-a-dev/register` repo, not here. The old `mr-stark87.github.io/snor-site/` URL
still resolves and redirects, so don't treat it as broken.

All internal asset references are relative, so the site works at a subpath and at
a domain root without changes. Only the absolute URLs in `index.html`'s `<head>`
(`canonical`, `og:url`, `og:image`, `twitter:image`) name the domain — update them
if the domain ever changes.

```
# preview locally (any one)
python -m http.server 8000
npx serve .
```

## Structure

- `index.html` — all sections plus the download panel
- `styles.css` — design tokens and layout. The palette follows the app: ground `#111817`, accent `#bcdf9c`.
- `app.js` — progressive enhancement only: mobile nav, copy buttons, release metadata, year stamp
- `assets/screenshots/` — copied from `Snor/docs/screenshots/` (hero, flow, editor, dim, memory)
- `version.json` — release version, asset URL, size and SHA-256

## Design notes

The layout language is borrowed from the Eaze landing site (`../eaze-site`): oversized
editorial type, a very slow vertical rhythm, heavily rounded surfaces, uppercase
micro-labels, and window chrome. The palette is still Snor's own — ground `#111817`,
moss accent `#bcdf9c`.

- **Type scale.** The hero is the page: one headline at up to `4.1rem`, tight leading and
  negative tracking, set as two block lines. The ceiling is deliberate — it keeps the longer
  line on one line at desktop, and falls back to balanced wrapping below that rather than
  overflowing. Section headings cap lower so the hero stays dominant.
- **Rhythm over boxes.** Sections are separated by `--gap-sec` (96–190px), not by borders.
  Feature copy is micro-label + heading + muted prose in a two-column grid with no chrome
  at all; hairlines are reserved for tables and the window frames.
- **Rounded surfaces.** Radii climb with size — `4px` on `kbd`, `22px` on window frames,
  `38px` on the download panel — so small chrome stays technical while large surfaces soften.
- **Window chrome.** Screenshots and shell snippets share one frame: three dots, a mono
  title, and a badge or link. A screenshot therefore reads as a running app and a snippet
  reads as a running shell.
- **Two type roles.** Instrument Sans carries prose; JetBrains Mono carries structure —
  section indices, labels, chrome, metadata, table headers. The mono is the product's own
  voice, which suits a tool you drive from a shell.

Sections are numbered `01`–`07`; the download panel is deliberately unnumbered — it's a
destination, not a chapter.

Motion is opt-in and cheap: `[data-reveal]` targets fade up once via `IntersectionObserver`,
the custom cursor runs on fine pointers only, and the film grain is static rather than
animated. All of it is disabled under `prefers-reduced-motion`. `[data-reveal]` elements are
hidden only while `html.js` is set (added by an inline script before paint), so a script-less
load shows the whole page.

## Updating to a new release

1. Publish the exe as a GitHub Release asset.
2. Update `version`, `releaseName`, `downloadUrl`, `file`, `sizeHuman` and `sha256` in `version.json`.
3. Mirror the same values in the `#download` panel in `index.html`.

`app.js` fetches `version.json` and overwrites the card at runtime, so the JSON is the
working source of truth. The inline copies exist as the fallback for `file://` and offline
viewing — keep both in step.

Both download buttons point at the release asset URL. Never commit the exe to this repo.

The Snor app repo itself is untouched by this site — screenshots are copies.
