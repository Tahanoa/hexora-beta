# Zarinpal payments

This stage adds payment infrastructure and admin-issued invoices, ready for a future digital-product checkout. It does not yet add a product catalog, licenses or download entitlements.

## Setup

1. Run against the existing PostgreSQL database. With the project's default `JPA_DDL_AUTO=update`, Hibernate creates `payment_gateway_settings` and `payments`; deployments using `validate` must provision these entity tables before startup.
2. Set `PAYMENT_ENCRYPTION_KEY` to a stable secret of at least 32 characters. If omitted, the existing `JWT_SECRET` is used. Merchant IDs are encrypted with AES-GCM, including the credential snapshot retained for each payment. Do not change this key without re-encrypting existing records; prefer a separate payment key so JWT key rotation does not affect payments.
3. Sign in as an admin and visit `/manage/payments`.
4. Enter your merchant UUID and the absolute HTTPS callback URL, e.g. `https://your-domain.com/api/payments/callback`. Enable the gateway and save. Leaving the merchant field empty preserves its existing value; API responses never disclose the merchant ID.
5. Issue an invoice for an existing username. Amounts are whole **toman (IRT)**, with a minimum of 1,000 toman. The buyer signs in at `/payments`, selects Pay, and is redirected to Zarinpal.

Disabling the gateway prevents new requests. Existing authorities can still be paid and verified, using their saved merchant credential, even after gateway settings change.

## Payment integrity

- Admin APIs require ADMIN; buyer APIs require authentication and enforce ownership.
- The server stores the invoice amount. Checkout accepts only an invoice ID, never a client-supplied amount or callback URL.
- Uses the supplied v4 `request.json`, `verify.json` and `unVerified.json` documentation at `https://payment.zarinpal.com/pg/v4/payment/`.
- A browser callback cannot mark an invoice paid. Only server verification code 100 or 101 with a valid reference marks it PAID.
- PostgreSQL row locks, optimistic versions and unique authorities serialize retries. A repeated callback returns the same paid invoice without changing its confirmation date.
- A failed/cancelled callback remains pending rather than permanently blocking a later valid callback. Transient verification errors preserve the authority for a buyer/admin retry.
- Recovery retrieves up to the gateway's last 100 unverified payments and verifies only matching local authorities. It does not create invoices for unknown transactions.
- HTTPS calls have 5-second connection and 15-second read timeouts. Bank card secrets are never collected; only the masked PAN returned by verification is stored.
- Gateway fees are retained as returned; revenue charts use verified invoice amounts in IRT.

## Reporting

The responsive FA/EN panel shows verified revenue, successful payment count, average purchase and invoice count. Daily revenue uses `Asia/Tehran` and **confirmation date**. Status distribution uses **invoice creation date**. Reports include both date boundaries and support up to one year. Lists are paginated, with an independent status filter. Empty graphs use actual zero values, never sample sales.

## API routes

| Method | Path | Access / purpose |
|---|---|---|
| GET / PUT | `/api/payments/admin/settings` | Admin gateway settings |
| POST | `/api/payments/admin/invoices` | Admin creates `{buyer, amount, description}` |
| GET | `/api/payments/admin/transactions?page=0&status=PENDING` | Admin paginated list |
| GET | `/api/payments/admin/report?from=2026-10-01&to=2026-10-31` | Admin report |
| POST | `/api/payments/admin/transactions/{id}/verify` | Admin retries verification |
| POST | `/api/payments/admin/reconcile` | Admin recovers unverified payments |
| GET | `/api/payments/mine?page=0` | Current buyer's invoices |
| POST | `/api/payments/{id}/checkout` | Owner initiates or resumes payment |
| POST | `/api/payments/{id}/verify` | Owner retries verification |
| GET | `/api/payments/callback?Authority=...&Status=OK` | Public gateway callback / receipt |

No gateway payment or automated test was run for this implementation. JavaScript syntax and patch whitespace were checked. Maven compilation could not reach Maven Central to resolve the existing Spring Boot parent dependency in this environment.
