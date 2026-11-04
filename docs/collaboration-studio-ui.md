# Continuous collaboration chapters

The public `/collaboration` page presents the existing five stages as a continuous editorial narrative: discovery, scope, design, build/review and handover. Every stage stays visible, with a large outlined chapter number, description, each participant's role and an emphasized outcome. A sticky index and counter identify the chapter reached while scrolling. On mobile, the index becomes a compact horizontally scrollable navigation bar. There is no tab panel, map or hidden process content.

The original pre-redesign `firefly-field` markup is restored with all 15 particles and the existing shared keyframes, timings, glow and responsive behavior. No replacement particle engine or new particle animation is added. The field remains decorative and cannot capture pointer input. The site's existing reduced-motion preference hides it.

Only this template and dedicated assets change. Contact's restored design, the public shell, profile data, loader, auth and backend are unchanged. Content is fully readable without the dedicated script, and native index links target real chapter IDs. Language switching updates text without rebuilding content. Timelines, revisions and support remain subject to project agreements.

Additional motion: one-time 450ms/12px heading entrances, short current-index and progress emphasis, with no scroll hijacking or automatic stage changes. Scroll work is scheduled once per animation frame and only current-stage changes update the DOM. Reduced motion cancels active heading animations. The existing particles provide the ambient movement requested by the user. No screenshot previews are produced.

Validation: Maven package, i18n checks and `scripts/check-collaboration-studio-browser.cjs` (Playwright; `HEXORA_TEST_BASE_URL`, optional `HEXORA_CHROMIUM`). The browser test verifies all five visible chapters, 15 original actually moving particles, pointer transparency, native keyboard anchors, scroll index/counter updates, FA/EN at five viewport widths, 44px controls, reduced motion, real CTA links and a blocked-script fallback. No screenshots or preview artifacts are generated.
