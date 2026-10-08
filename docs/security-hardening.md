# Authentication and chat hardening

Implemented security review findings 1–4 only. Existing PostgreSQL/JPA schema update creates the new tables/column; no migration files or additional database are introduced.

- JWT validation checks account enabled/locked/expired/credentials state and current `users.token_version` on every authenticated request. New JWTs carry `tokenVersion`; tokens issued before this update require sign-in again.
- Password changes lock the user row, verify the current password, update the hash and increment token version in one transaction. This invalidates every earlier token for that account. Login locks the user before issuance and refreshes the locked account and rechecks the password against its current hash. Phone updates also lock the account to prevent overwriting a concurrent token-version change.
- Logout revokes the signed token's `jti` in `revoked_tokens` until expiration. All UI logout buttons await server confirmation before clearing credentials. Network/server failure shows a notification instead of claiming success. Expired/invalid tokens return 401 and are cleared locally.
- Login: 30 requests per IP per 15-minute window, plus 10 per canonical account per 15 minutes. Username/email aliases share the account counter. Failed attempts introduce progressive blocking from the third failure, up to 60 seconds; successful authentication resets the failure delay, not the request budget.
- Registration: 5 requests per IP per hour. IP limits run before request-body binding, including malformed attempts. Remote IP is taken from the servlet connection, never arbitrary `X-Forwarded-For`. Behind a reverse proxy, configure trusted proxy forwarding at the deployment layer; otherwise clients share the proxy IP budget.
- Login fields and current-password fields have length limits. `expiresIn` reflects configured JWT lifetime.
- User chat: 5 send attempts per minute and 100 per 24-hour window; at most 1,000 retained incoming messages and 5 MiB of UTF-8 text plus attachment bytes per account. Admin replies do not consume the user's allowance. Existing messages are preserved; users already above the quota cannot send more until staff removes received messages.
- Chat storage quota checks and writes serialize on the account row to prevent concurrent quota bypass. Text and attachments use the same save path. Rate counters commit separately, so rejected/rolled-back requests still consume a budget.
- Admin conversation lists are paginated at 20 threads, with Previous/Next controls. History retains its existing cursor pagination.
- Request limit keys are SHA-256 hashes of scope and identity. PostgreSQL upserts coordinate instances. Expired request counters and token revocations are removed hourly. Rate limits use fixed windows and are not a substitute for proxy connection/body limits.

Validation: source/transaction review, JavaScript syntax and whitespace checks. Automated tests and live gateway calls were not run. Full Java compilation and PostgreSQL runtime validation were not available in this environment.
