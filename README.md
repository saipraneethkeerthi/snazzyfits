# SnazzyFits — Wear your attitude

React storefront, Express/Node API, and optional MongoDB newsletter storage. A separate redesign of SnazzyFits; no production store code, payment, authentication, product API, database, order or admin settings were changed.

## Run locally

Requires Node 20.20+.

```powershell
npm ci
Copy-Item .env.example .env
npm run server
# In another terminal:
npm run dev
```

Open http://127.0.0.1:5173. The Express API runs on port 4000. To serve the production bundle from Express, run `npm run build`, then `npm run server` and open http://127.0.0.1:4000.

## Features

- Responsive editorial homepage with thirteen requested sections, real brand/model imagery, subtle hero scroll motion, lazy image loading, and reduced-motion support.
- 24 genuine products, source prices and attributes, discounted-price badges, separate arrival and best-seller selections without repeated product IDs.
- Collection and style routes, sorting, search, product details, option selection, and quick-add dialog.
- Wishlist stored only on this browser. Cart and account links use the existing store. Product options are carried to the existing product page with WooCommerce attribute parameters; final variation availability and price are confirmed there.
- Existing checkout remains the purchase authority. The redesign does not submit orders or claim that a product has been added to a cart.
- Accessible modal focus trapping and Escape handling, semantic headings, focus styles, labeled forms, responsive images, and keyboard controls.
- Page titles, canonical URLs, Open Graph text metadata, organization/product JSON-LD. Real rating data appears only when reviews exist.

## Data and authenticity

Read-only catalog source: https://snazzyfits.in/wp-json/wc/store/v1/products. Snapshot fetched 7 October 2026. `src/data/products.json` keeps store IDs, links, attributes, prices and source image URLs. The homepage best-seller selection starts with the first two products returned by the store's popularity endpoint, then includes two complementary products. The remaining product sections exclude those IDs.

The store's public review endpoint and video media endpoint returned empty arrays. No reviews or ratings were fabricated. The review section invites real customers to review their purchase. Hero and campaign videos are six-second seamless motion loops rendered from the existing brand photographs; they are not filmed footage. Instagram tiles use brand product imagery and link to the existing verified Instagram handle; they are not presented as a live social feed.

## Motion and interactions

The existing layout, typography, content, routes, product data and purchase flow are preserved. `src/motion.js` uses one passive scroll listener, a queued animation frame, and IntersectionObserver for one-time section/card reveals. Hero content moves at most 26px, media scale tops out at 1.035, and selected editorial imagery has a total parallax travel of 20px (±10px). Image masks appear only on category/editorial imagery. Product stagger is capped at 165ms.

On desktop, the brand visual stays sticky while the active story text and visual caption change as you scroll. Mobile keeps the stacked story layout. Buttons, wishlists, cart navigation, product cards, toasts and dialogs have short, restrained feedback. Navigation begins immediately; no scroll is intercepted.

Videos are local, muted, looping, inline and poster-backed. Sources are assigned only on visibility, and playback pauses offscreen and when the document is hidden. The hero and campaign have manual pause controls. Reduced-motion users get still images and no reveal, parallax, scale, movement or interaction animation. Live changes to the preference are honored; data-saver users keep the posters. If autoplay or decoding fails, the original image remains visible. Replace `public/videos/hero-men.webm`, `hero-women.webm`, and `campaign.webm` with supplied footage when available.

`scripts/create-motion-clips.mjs` regenerates the current loops using Sharp and a local FFmpeg executable. Set `FFMPEG_PATH` if the Playwright FFmpeg installation is elsewhere. No new runtime motion dependency was added.

`npm run server` reads the catalog live, with a five-minute server cache. The browser falls back to the downloaded snapshot if the API cannot respond. Static Sites previews intentionally use the snapshot. To use the live API on a separately hosted storefront, set `VITE_API_ORIGIN` before rebuilding and set the API's `STOREFRONT_ORIGIN` to the exact frontend origin.

## Newsletter and MongoDB

Set `MONGODB_URI` to a **separate newsletter database**, not the existing order database. The API then persists consent and normalized email addresses, uses a unique email index, avoids duplicate subscriptions, and rate-limits requests. This saves subscriptions; an email provider must be connected separately to send newsletters. Without MongoDB, the endpoint returns a clear 503 response and the form displays an honest availability message. It never reports false success. The private static preview has no newsletter database or running Express server.

## Hosting

`.openai/hosting.json` publishes the React bundle as a private Sites preview. `_redirects` enables SPA deep links. The full MERN deployment requires a Node-compatible host and a MongoDB instance. Set `HOST=0.0.0.0` on a production Node host, `MONGODB_URI` and the public `VITE_API_ORIGIN`, then build and run the API. The live snazzyfits.in domain was not modified.

## Validation

```powershell
npm run build
npm run check
npm run test:api
node scripts/browser-check.mjs
node scripts/motion-check.mjs
```

Browser checks require the local frontend plus Playwright Chromium (`npx playwright install chromium`). The default regression URL is port 5173; set `QA_BASE_URL=http://127.0.0.1:4173` to check the production bundle served by `npm run preview -- --port 4173`. They cover 360, 390, 430, 768, 1024, 1440 and 1920 pixels, images/overflow, wishlist, search, filters/sorting, quick add/options, Escape and focus restoration, reduced motion and newsletter failure feedback. The motion check defaults to port 4173 and verifies video loading/playback, pause/offscreen behavior, scroll effect bounds, desktop sticky story, stable media nodes during wishlist changes, mobile stacking and live preference changes. Lighthouse targets are goals, not certified scores; run a hosted audit before replacing the live store.
