# Snor-site — landing site for Snor

Static site. No build step — open `index.html` directly or serve the folder.

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

Two decisions carry the layout, and both are deliberate:

- **Rules instead of boxes.** Only genuinely boxed things — code bars, the download panel,
  the framed screenshots — get a border. Everything else is separated by hairlines and
  space. That is why the page doesn't read as a stack of identical cards.
- **Two type roles.** Instrument Sans carries prose; JetBrains Mono carries structure —
  section indices, labels, metadata, table headers. The mono is the product's own voice,
  which suits a tool you drive from a shell.

Sections are numbered `01`–`07`. The download panel is deliberately unnumbered: it's a
destination, not a chapter. Feature blocks use two different patterns (a lead-plus-supporting
split for Flow Mode, a ruled spec list for the Editor) so the scroll has rhythm.

## Updating to a new release

1. Publish the exe as a GitHub Release asset.
2. Update `version`, `releaseName`, `downloadUrl`, `file`, `sizeHuman` and `sha256` in `version.json`.
3. Mirror the same values in the `#download` panel in `index.html`.

`app.js` fetches `version.json` and overwrites the card at runtime, so the JSON is the
working source of truth. The inline copies exist as the fallback for `file://` and offline
viewing — keep both in step.

Both download buttons point at the release asset URL. Never commit the exe to this repo.

The Snor app repo itself is untouched by this site — screenshots are copies.
