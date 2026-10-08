# Zarinpal payments

This stage adds payment infrastructure and admin-issued invoices, ready for a future digital-product checkout. It does not yet add a product catalog, licenses or download entitlements.

## Setup

1. Run against the existing PostgreSQL database. With the project's default `JPA_DDL_AUTO=update`, Hibernate creates `payment_gateway_settings` and `payments`; deployments using `validate` must provision these entity tables before startup.
2. Set `PAYMENT_ENCRYPTION_KEY` to a stable secret of at least 32 characters. If omitted, the existing `JWT_SECRET` is used. Merchant IDs are encrypted with AES-GCM, including the credential snapshot retained for each payment. Do not change this key without re-encrypting existing records; prefer a separate payment key so JWT key rotation does not affect payments.
3. Sign in as an admin and visit `/manage/payments`.
4. Enter your merchant UUID and the absolute HTTPS callback URL, e.g. `https://your-domain.com/api/payments/callback`. Enable the gateway and save. Leaving the merchant field empty preserves its existing value; API responses never disclose the merchant ID.
5. Issue an invoice with just an amount and description; no username is needed. Amounts are whole **toman (IRT)**, with a minimum of 1,000 toman. Copy the invoice link from the creation form or transaction row. The buyer opens `/invoice/{id}`, selects Pay and is redirected to Zarinpal without registration or sign-in.

Disabling the gateway prevents new requests. Existing authorities can still be paid and verified, using their saved merchant credential, even after gateway settings change.

## Payment integrity

- Admin APIs require ADMIN. Public invoice APIs use the unguessable UUID in the direct link as the access capability; there is no public invoice listing. Public responses contain invoice details and the payment reference, never buyer usernames, masked PANs or merchant credentials. Invoice pages and responses disable caching and referrer sharing.
- The server stores the invoice amount. Checkout accepts only an invoice ID, never a client-supplied amount or callback URL.
- Uses the supplied v4 `request.json`, `verify.json` and `unVerified.json` documentation at `https://payment.zarinpal.com/pg/v4/payment/`.
- A browser callback cannot mark an invoice paid. Only server verification code 100 or 101 with a valid reference marks it PAID.
- PostgreSQL row locks, optimistic versions and unique authorities serialize retries. A repeated callback returns the same paid invoice without changing its confirmation date.
- A failed/cancelled callback remains pending rather than permanently blocking a later valid callback. Transient verification errors preserve the authority for a link-holder/admin retry.
- Recovery retrieves up to the gateway's last 100 unverified payments and verifies only matching local authorities. It does not create invoices for unknown transactions.
- HTTPS calls have 5-second connection and 15-second read timeouts. Bank card secrets are never collected; only the masked PAN returned by verification is stored.
- Gateway fees are retained as returned; revenue charts use verified invoice amounts in IRT.

## Reporting

The responsive FA/EN panel shows verified revenue, successful payment count, average purchase and invoice count. Daily revenue uses `Asia/Tehran` and **confirmation date**. Status distribution uses **invoice creation date**. Reports include both date boundaries and support up to one year. Lists are paginated, with an independent status filter. Empty graphs use actual zero values, never sample sales.

## API routes

| Method | Path | Access / purpose |
|---|---|---|
| GET / PUT | `/api/payments/admin/settings` | Admin gateway settings |
| POST | `/api/payments/admin/invoices` | Admin creates `{amount, description}` |
| GET | `/api/payments/admin/transactions?page=0&status=PENDING` | Admin paginated list |
| GET | `/api/payments/admin/report?from=2026-10-01&to=2026-10-31` | Admin report |
| POST | `/api/payments/admin/transactions/{id}/verify` | Admin retries verification |
| POST | `/api/payments/admin/reconcile` | Admin recovers unverified payments |
| GET | `/api/payments/invoices/{id}` | Direct-link invoice details |
| POST | `/api/payments/invoices/{id}/checkout` | Initiate or resume invoice payment |
| POST | `/api/payments/invoices/{id}/verify` | Retry invoice verification |
| GET | `/api/payments/callback?Authority=...&Status=OK` | Public gateway callback / receipt |

The `/payments` account page and its public-header link have been removed. The admin page uses the shared sidebar and topbar, with payment CSS scoped to content so navigation remains consistent with the other dashboard pages. The old buyer column is retained internally for compatibility with existing PostgreSQL installations; new invoices are independent of users.

No gateway payment or automated test was run for this implementation. JavaScript syntax and patch whitespace were checked. Maven compilation could not reach Maven Central to resolve the existing Spring Boot parent dependency in this environment.
