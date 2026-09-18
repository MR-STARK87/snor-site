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
- `app.js` — nav toggle, copy buttons, mock-download notice
- `assets/screenshots/` — copied from `Snor/docs/screenshots/` (hero, flow, editor, dim, memory)
- `downloads/Snor-0.1.0-windows-x64.exe` — MOCK placeholder, verifies download flow
- `version.json` — version + swap instructions for the real signed release

## Going live with the real .exe

1. `cargo build --release` in the Snor repo, sign the exe.
2. Attach it to a GitHub Release.
3. Replace `downloads/Snor-0.1.0-windows-x64.exe` with the signed binary (same name),
   or point the two download hrefs in `index.html` at the release asset URL.
4. Update size + SHA-256 in `version.json` and the `#download` card.

The Snor app repo itself is untouched by this site — screenshots are copies.
