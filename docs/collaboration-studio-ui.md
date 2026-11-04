# Interactive collaboration route

The public `/collaboration` page presents the existing five stages as an explorable route: discovery, scope, design, build/review and handover. A curved map with raised numbered stops controls a stage panel explaining the purpose, each participant's role and the expected outcome. The primary title remains larger than the supporting slogan. Supporting principles and a contact/services CTA complete the page. Timing, revisions and support are explicitly subject to project agreements; no invented pricing or guarantees are added.

Only this template and dedicated CSS/JS are changed. Public header/footer, profile links, page loader, auth and backend remain shared and unchanged. Contact's prior design is preserved. The map uses SVG and CSS instead of a dependency or canvas render loop. Its physical left-to-right ordering remains consistent in both locales; the stage explanation follows the document's text direction.

Progressive enhancement: without the dedicated script, all five stages remain visible and map links jump to real section IDs. With JS, the map becomes a tablist with a single focusable selected tab, associated tabpanels, ArrowLeft/ArrowRight, Home/End, and previous/next controls. Selected stage and focus survive locale updates. Disabled boundary controls move focus to their enabled neighbor after activation.

Motion is user initiated: 360ms/10px panel entrances, short selected-state transitions and path emphasis; no automatic cycling or looping particles. OS reduced motion and the shared site preference cancel active entrances and suppress CSS motion. Estedad is served locally. All styles are scoped to `.cw-*` and the dedicated route body.

Verification: Maven package, i18n checks and `scripts/check-collaboration-studio-browser.cjs` using Playwright (`HEXORA_TEST_BASE_URL`, optional `HEXORA_CHROMIUM`). Checks cover all five stages, map and previous/next controls, keyboard order, locale/state retention, five viewport widths, unclipped 44px nodes, reduced motion, real CTA links and a blocked-script fallback. No screenshots or preview artifacts are generated.
