# Snor-site — landing site for Snor

Static site. No build step — open `index.html` directly or serve the folder.

```
# preview locally (any one)
python -m http.server 8000
npx serve .
```

## Structure

- `index.html` — all sections + download card
- `styles.css` — Snor dark-green palette (`#111817`, accent `#BCDF9C`)
- `app.js` — nav toggle, copy buttons
- `assets/screenshots/` — copied from `Snor/docs/screenshots/` (hero, flow, editor, dim, memory)
- `version.json` — release version + asset URL, size, SHA-256 (source of truth for the download card)

## Updating to a new release

1. Publish the exe as a GitHub Release asset.
2. Update `version`, `downloadUrl`, `size`, `sizeHuman`, `sha256` in `version.json`.
3. Mirror those values in the `#download` card in `index.html` (both download buttons point at the release asset URL — never commit the exe to this repo).

The Snor app repo itself is untouched by this site — screenshots are copies.
