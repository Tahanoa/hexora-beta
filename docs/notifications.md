# Unified user feedback

Every full site, account and admin template loads `/js/notifications.js` and `/css/notifications.css` before page scripts. `HexoraNotify` provides success (green), error (red), warning (amber) and information/progress (blue) feedback. The existing `showToast(type, title, message, duration)` API forwards to this shared renderer.

- `show(type, message, options)` supports title, duration and keyed updates.
- `feedback(message, error, {source, key, type})` replaces transient inline status helpers. Empty feedback clears an active progress notice; completed notices remain dismissible.
- `await confirm(message)` presents an accessible modal with explicit confirm/cancel buttons. Escape cancels and focus returns to the originating control. `await prompt(message, value, {type, min, step})` handles the old cleanup prompt.
- Notifications support RTL/LTR, mobile sizing, reduced motion, icons independent of external fonts, hover/focus pause and screen reader alerts. At most four notices are active, duplicate keyed messages are coalesced, and feedback remains visible above open editing dialogs.
- Messages, titles and confirmation text use textContent; only fixed local icon markup is inserted as HTML. Form validation uses a warning notification, focuses the invalid control and marks the field.
- Product, invoice, payment, account, media, chat, CRUD, demo, profile, login/register and public loading failure paths use the common system. Contextual empty states, retry controls, upload queue state, order status and actual chat messages remain page content.
- Validation: JavaScript syntax checks across all scripts, template inclusion review and whitespace checks. Automated tests and live application/gateway verification were not run.

Routine CRUD page loading does not create progress/count notifications; skeletons show loading in place, while failures and explicit user actions still notify.

Admin chat supports permanent deletion of one incoming message (including its stored attachment) or all incoming messages in the selected conversation. Replies are preserved. Routes are ADMIN-only and validate message/conversation ownership. The current admin conversation refreshes after deletion; other open clients reflect hard-deleted messages after refreshing their history.
