# User management

Admin page: `/manage/users`. Uses the shared dashboard sidebar/topbar, responsive rows, Persian/English labels and existing notifications/confirmation dialogs.

- Search username, email and phone; filter by enabled state and primary role; list 20 users per page. Summary shows total, enabled, disabled and enabled administrators.
- Inspect account ID, immutable username, creation date and contact details; edit email, phone, role and enabled state.
- Roles reflect existing USER, VIEWER, EDITOR and ADMIN values. Assigning a role retains USER baseline membership. This feature does not grant new permissions to VIEWER/EDITOR; existing security rules still control their access.
- All account changes increment the token version; user must sign in again. The explicit Sign out all devices action revokes all prior JWTs without changing account details. Editing your own details/sign-outs returns you to login.
- Backend reads/writes require ADMIN at both request and controller method layers. Responses whitelist fields and never include password hashes or tokens.
- Administrators cannot disable or demote themselves. Last enabled administrator is protected. PostgreSQL transaction advisory lock serializes admin changes across instances, with target account row locks and revision checks to reject stale updates.
- Usernames and IDs stay stable; disabling accounts does not delete invoices, product ownership, messages or financial history. JPA adds a `users.row_version` column with a default of zero to detect stale updates, including concurrent phone/password changes. No new table or migration file is introduced.
- No account/password creation, hard deletion or password viewing is offered in this version. Users register through the existing registration flow.

API: GET `/api/users/admin`, GET `/stats`, GET `/{id}`, PUT `/{id}` with `{email,phone,role,enabled,revision}`, POST `/{id}/revoke-sessions` with `{revision}`.

Validation: source review, JavaScript syntax and whitespace checks. No automated tests; full Java compilation and live database/browser verification unavailable in this environment.
