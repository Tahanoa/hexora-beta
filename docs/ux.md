# Shared interface behavior

`ux.css` supplies shared spacing, heading/control sizes, visible focus, mobile touch targets, skeletons and action states. It does not replace the homepage hero layout. `ux.js` adds a skip link, localized motion control and a fallback keyboard handler for tabs that do not already handle arrow keys.

The loader no longer imposes a three-second delay or waits for unrelated images/fonts. It finishes when the document shell is ready and explicit essential holds are released. `holdPageLoader()` remains idempotent; `holdPageLoader({blocking:false})` is used for public data sections that display their own skeletons. Always release essential holds on failure as well as success.

Use `HexoraUX.state(...)` for actionable empty/error states and `HexoraUX.skeleton(target)` for initial section loading. Retry controls must be connected to a real retry handler. Server-provided content must remain escaped.

Chat drafts are scoped to the account and recipient. Review drafts are scoped to the account and product. They use sessionStorage in the current tab, expire after 24 hours and are cleared on confirmed submission or logout. Failed submissions retain drafts. Passwords, payment credentials and attachments are never registered as draft fields. This is a local convenience, not a server-side backup or cross-device sync.

Validation (running local app):

```bash
NODE_PATH=/path/to/playwright/node_modules node scripts/check-ux-browser.cjs
ADMIN_USERNAME=... ADMIN_PASSWORD=... NODE_PATH=/path/to/playwright/node_modules node scripts/check-page-loaders.cjs
```

Set `HEXORA_TEST_BASE_URL` for another port and `HEXORA_CHROMIUM` for a system Chromium binary. The UX test uses intercepted API fixtures; loader route checks use an actual local administrator login.
