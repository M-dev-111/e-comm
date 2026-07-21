# mCOM

A static e-commerce + quick-commerce storefront built with React 19, Vite, Tailwind CSS v4,
React Router and Framer Motion. All content is static and lives in [`src/data/data.js`](src/data/data.js).

## Local development

```bash
npm install
npm run dev      # dev server
npm run build    # production build → dist/
npm run preview  # serve the production build locally
npm run lint
```

## Deploying to Netlify

The app is a single-page app, so the host must (a) serve the **built `dist/` folder**, not the
project root, and (b) fall back to `index.html` for client-side routes.

**Option A — connect the Git repo (recommended).** Netlify reads [`netlify.toml`](netlify.toml)
and needs no manual setup: build command `npm run build`, publish directory `dist`, SPA
redirect and asset caching are all configured there.

**Option B — drag and drop.** Run `npm run build`, then drag the **`dist` folder itself** onto
Netlify — never the project root. `public/_redirects` is copied into `dist` at build time, so
client-side routing keeps working.

**Option C — Netlify CLI.**

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

### Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| White screen, console says a module script was served as `application/octet-stream` | The site root was published instead of `dist`, so the browser requested `/src/main.jsx` (an unbuilt source file the host can't type) | Publish `dist` — Option A, B or C above |
| Home page works, but refreshing `/cart` or `/product/p1` returns 404 | No SPA fallback | Ensure `_redirects` or `netlify.toml` is deployed |
| Stale UI or old favicon after deploying | Browser cache | Hard reload with Ctrl+Shift+R |
