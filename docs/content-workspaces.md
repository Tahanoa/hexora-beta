# Dashboard content workspaces

`/manage/skills`, `/manage/experience` and `/manage/services` load a scoped workspace module and stylesheet through a conditional block in `dashboard/manage.html`. Other management sections retain their existing UI. The module reuses the existing management form renderers, authenticated API requests, icon catalog, SVG uploads, media selection/upload and Solar Hijri date picker. No backend, database, authorization or public-site changes are included.

All three pages use the dashboard's existing color and font tokens, statistics cards, searchable paginated lists, filters, retry/empty states and data-dependent skeletons. The global loader is released after administrator authentication so that the list skeleton remains visible while its request completes. There is no artificial wait.

Skills have category filters, proficiency meters and a collapsible icon browser. Experience uses a timeline and current/past filters; selecting a current role clears the end date to follow the existing API rule. Services show publication/featured status and covers, and group their editor into collapsible sections. Existing nested service fields, FAQs, deliverables and related project IDs are preserved.

Editors use native modal dialogs with sticky save actions, inline validation and unsaved-change guards. Saving failures preserve the form. Upload behavior remains unchanged: uploaded media stays in the library even if an edit is cancelled. No persistent draft storage or draft-management panel is added.

Animations are brief, use opacity/transform, and respect reduced-motion settings. Each page supports Persian/English and small screens. The new UI never interpolates user content without escaping it.

## Verification

- Maven packaging succeeds.
- `scripts/check-content-workspace-browser.cjs` tests skeleton/error/retry states, pagination, search and filters, create/edit/delete payloads, failed-save preservation, unsaved-change cancellation, existing nested fields and dates, service media selection, responsive dialogs at 320/390/768/1440px, FA/EN, reduced motion, and an unchanged statistics page. No screenshots are generated.
- A live local browser integration with real administrator authentication and PostgreSQL created and edited all three resource types, checked unauthenticated API rejection and removed its fixtures.
- Existing i18n and admin-shell checks pass.

Run the browser script with Playwright available to Node, `HEXORA_TEST_BASE_URL`, and optionally `HEXORA_CHROMIUM`. `HEXORA_TEST_SECTION` restricts it to one of the three resource types for diagnosis.
