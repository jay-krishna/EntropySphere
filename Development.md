# Development

This document contains development, deployment, and local-testing information for contributors and maintainers.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The whole app (HTML + CSS + JS in one file) |
| `manifest.webmanifest` | PWA metadata (name, icons, colours, display mode) |
| `sw.js` | Service worker — offline app shell + font caching |
| `image/` | App icons and favicons |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

## Deploy to GitHub Pages

1. Create a new repository and add all files to the **root** of the default branch. Keep the file names and relative paths as they are.
2. Push to GitHub.
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick `<default_branch>` and `/ (root)`, then **Save**.
5. Wait ~1 minute, then open the URL it shows (e.g. `https://<you>.github.io/<repo>/`).

All paths in the app are relative, so it works from a project subpath without changes. GitHub Pages is served over HTTPS, which the service worker requires.

## Updating

Bump the `VERSION` constant in `sw.js` (for example `v1.0.1`) whenever you change the app. The new service worker will replace the old cache on the next visit and pick up the updated files.

## Local testing

A service worker requires `http(s)`, not `file://`. To run a simple local server from this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Notes:
- Fonts load from Google Fonts and are cached on first online visit. If you open the app offline before fonts are cached, it will fall back to system fonts.
- The service worker implements an app-shell caching strategy; consult `sw.js` for details.
