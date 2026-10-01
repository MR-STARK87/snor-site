# Snor-site — landing site for Snor

Static multi-page site. No build step — open `index.html` directly or serve the folder.

## Deployment

Published on GitHub Pages from `main` (root). The custom domain
**https://snor.is-a.dev/** is set by the `CNAME` file at the repo root, which must
contain exactly `snor.is-a.dev` with no scheme, path or trailing spaces.

The `is-a.dev` DNS record (`CNAME` → `mr-stark87.github.io`) lives in the
`is-a-dev/register` repo, not here. The old `mr-stark87.github.io/snor-site/` URL
still resolves and redirects, so don't treat it as broken.

Internal references are relative, so the site works at a subpath and at a domain
root without changes. **`404.html` is the one exception** — it uses absolute paths
(`/styles.css`, `/docs.html`), because Pages serves it for a request at any depth
and relative links would resolve against the missing directory. If the site ever
moves off the domain root, that file is the one to fix.

The absolute URLs in each page's `<head>` (`canonical`, `og:url`, `og:image`,
`twitter:image`) name the domain — update them if the domain ever changes.

```
# preview locally (any one)
python -m http.server 8000
npx serve .
```

## Structure

| File | Content |
| --- | --- |
| `index.html` | Landing page: hero, stats, why, Flow Mode, editor, Dim Mode, memory, shortcuts, scope, closing CTA |
| `docs.html` | The manual: getting started, the workspace, Flow Mode, editor, Dim Mode, full keyboard reference, memory methodology, building from source, troubleshooting |
| `behind.html` | Narrative: the problem, the idea, the road to 155 MB, what was left out, roadmap, license |
| `download.html` | The release panel, checksum verification, requirements, build-from-source, first-run notes |
| `404.html` | Fallback route for Pages (absolute paths — see Deployment) |
| `styles.css` | Design tokens and all layout, shared by every page |
| `app.js` | Progressive enhancement only: mobile nav, copy buttons, release metadata, scroll progress, contents highlighting, reveals, cursor, year stamp |
| `assets/screenshots/` | Copied from `Snor/docs/screenshots/` (hero, flow, editor, dim, memory) |
| `version.json` | Release version, asset URL, size and SHA-256 |

`index.html` deliberately does not repeat what the other pages cover in full — the
shortcut table stops at four rows and links to `docs.html#shortcuts`, and the memory
section links to the methodology rather than duplicating it.

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

Landing-page sections are numbered `01`–`07`. Sub-pages open with `.page-hero` — the
same hero treatment at a smaller ceiling — and `docs.html` / `behind.html` use
`.docs-layout`: a sticky contents column beside a prose column, with the contents marked
up as you read.

- **Scroll indicator.** The default scrollbar is restyled rather than removed — a hairline
  moss track in WebKit and `scrollbar-width: thin` in Firefox — and a progress bar sits
  under the nav showing position in the page. The bar is the indicator; the scrollbar stays
  because hiding it entirely would remove the only draggable affordance.
- **Contents highlighting** is a scroll-position lookup, not an `IntersectionObserver` band.
  A band leaves gaps where nothing is "current", which shows as a contents list with nothing
  highlighted — worst at the top of the page, where the first section sits below the band.
- **The nav is cross-page.** Per-page anchors live in the footer's *Learn* group so they
  resolve from any page, and `aria-current="page"` marks the current one.

Motion is opt-in and cheap: `[data-reveal]` targets fade up once via `IntersectionObserver`,
the custom cursor runs on fine pointers only, and the film grain is static rather than
animated. All of it is disabled under `prefers-reduced-motion`. `[data-reveal]` elements are
hidden only while `html.js` is set (added by an inline script before paint), so a script-less
load shows the whole page.

**Deliberately not included:** a page-transition overlay like the reference site's. Its
version starts at full opacity and only clears on the `load` event, so with JavaScript
disabled it covers the page permanently. Not worth the risk for a wipe.

## Updating to a new release

1. Publish the exe as a GitHub Release asset.
2. Update `version`, `releaseName`, `downloadUrl`, `file`, `sizeHuman` and `sha256` in `version.json`.
3. Mirror the same values in the `#release` panel in `download.html`.

`app.js` fetches `version.json` on every page and overwrites whatever it finds, so the JSON
is the working source of truth. The inline copies in `download.html` are the fallback for
`file://` and offline viewing — keep both in step.

Every download button points at the release asset URL: the panel and closing CTA on
`download.html`, the hero button on `index.html` (`#heroDownload`), and the nav's Download
link (which navigates to the page, not the file). Release tag links are hardcoded to
`v0.8-snor` in the footers — update those too on a new release.

Never commit the exe to this repo.

The Snor app repo itself is untouched by this site — screenshots are copies.
