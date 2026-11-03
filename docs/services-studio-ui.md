# Services editorial index

The dedicated `/services` listing has a new editorial layout: numbered service chapters, actual audience and deliverables, optional covers, pricing and duration, and direct links to existing detail/contact routes. The hero's inline SVG illustrates discovery, definition and building; native buttons select each stage. The main page title remains larger than its supporting description. Estedad is self-hosted, and all styling is scoped to `.sv-page`.

The existing services loader/API and shared cards remain in place. `HexoraServiceStudio` delegates listing rendering only; the homepage, service details, admin and backend are unchanged. Existing featured ordering is preserved. Search covers title, descriptions, audience and deliverables; the featured filter and search survive language changes. Empty/error/retry states reuse the shared UX patterns. No fabricated service, duration, pricing or statistics are inserted.

Motion: one easing (`cubic-bezier(.2,0,0,1)`), 200ms feedback, 400ms one-time scroll entrances, travel at most 16px. No autoplay loops, 3D pointer tracking or scroll hijacking. OS reduced-motion and the site's motion switch remove movement, including active row animations. Text and selected-state information remain visible.

Verification: Maven package, `node scripts/check-i18n.cjs`, and Playwright `scripts/check-services-studio-browser.cjs` using `HEXORA_TEST_BASE_URL` and optional `HEXORA_CHROMIUM` / `HEXORA_SCREENSHOT_DIR`. Isolated API fixtures check responsive FA/EN layouts, search/filter/reset, actual links and deliverables, stage selection, locale retention, reduced motion, escaped text/unsafe covers, empty data, request failure/retry and the existing service-detail route. Screenshots use test fixtures, not production data.
