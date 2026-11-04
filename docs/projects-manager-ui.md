# Project administration

Only `/manage/projects` uses the dedicated project manager. Other management sections retain their existing template, scripts and styles. The only shared Java change selects the projects template in `PageController`; API authorization, DTOs, persistence and public pages are unchanged.

The page provides status totals, search, sorting, pagination, card/list views and direct public links. The modal editor groups existing project fields, keeps save actions accessible, reports validation errors next to inputs and warns before discarding edits. New entries receive an editable slug suggestion; editing a title never changes an existing slug. No draft-management panel or persistent form storage is added.

Covers use the existing authenticated media APIs. Administrators can reuse an image, upload one or enter an existing URL. Uploading saves a media asset immediately; cancelling a project form does not delete that asset. Project deletion also leaves its cover in Media.

## Verification

- Maven package succeeded.
- `scripts/check-projects-manager-browser.cjs`: mocked API browser integration against the running server template; load failures/retry, search/filter/pagination, create/edit/delete payloads, slug preservation, unsaved changes, validation, media selection/upload, Persian/English layouts at 320/390/768/1440px, and unchanged skills route. No screenshots generated.
- Live local browser integration passed with real administrator authentication and PostgreSQL: created and edited a project, verified status and slug persistence, then deleted the fixture.
- Existing i18n and admin-shell checks passed.
- Existing media-library check has an unrelated test-harness failure (`HexoraNotify is not defined`); its script and media implementation are unchanged.

Run browser checks with `HEXORA_TEST_BASE_URL`, optional `HEXORA_CHROMIUM`, and Playwright available to Node.
