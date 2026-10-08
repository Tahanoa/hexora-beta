# Digital products and private downloads

## Workflow

1. Configure the existing Zarinpal gateway at `/manage/payments`.
2. Create a draft at `/manage/products`: permanent slug, FA/EN titles, descriptions and per-line feature highlights, category, an image cover (upload with preview inside the editor or choose from the media library), requirements/installation instructions, optional HTTPS demo and whole-toman price. Price zero means free; paid products require at least 1,000 toman.
3. Upload a ZIP release up to 8 MB with a unique version label and changelog. Releases start as drafts. Download and review it before using “Reviewed; publish release”. File bytes cannot be replaced; upload a new version for changes.
4. Edit the product and enable publication. A product cannot be published until it has a published release. Withdrawing the last published release automatically removes the product from the catalog.
5. Buyers open `/products`, sign in/register, create a single-product invoice, read and accept its purchase/privacy/security terms, then pay through the existing Zarinpal gateway. After successful login, the app safely returns to the requested product page. Gateway callbacks verify server-side and return product buyers to their exact `/account/orders/{uuid}` invoice.
6. The user dashboard at `/account` has separate pages: `/account/products` for purchased products/releases and `/account/orders` for payment status, references, checkout recovery and verification. `/products/library` redirects to the new purchases page. Normal users enter their dashboard from the website account link and after login; `/dashboard` also routes normal users there. Existing buyers retain downloads of published releases when the product is hidden from the public catalog. Purchase includes access to subsequent published versions; there is no expiry/licensing in this stage.

After invoice consent, free products create a PAID, zero-value order with reference FREE without calling the gateway. These count as purchases in the existing sales metrics, with zero revenue. Catalog prices changing do not change the amount of a previously initiated pending order.

## Storage and schema

PostgreSQL only, using the project's existing `JPA_DDL_AUTO=update`. New tables: `products`, `product_releases`, `product_private_files`, `product_downloads`. Payments gain nullable product/purchaser IDs, request/verification cooldown timestamps, and a composite ownership index. Deployments using `validate` must provision the entity schema first.

File bytes are PostgreSQL `bytea` in `product_private_files`; they are not stored in the media table or static web directory. Version metadata and file bytes are separate, so catalog/library responses never serialize binary data. Covers use the existing validated public image-media flow. No new gateway credentials or external storage service is needed.

Admin product deletion removes the product from the store and management lists using an archive flag. Files and confirmed buyer entitlements remain available; draft/unpublish and release withdrawal still control publication.

## Security review and implemented controls

| Area | Implemented control |
|---|---|
| Admin authorization | Creation, metadata updates, uploads and release publication require ADMIN in both request rules and method security. |
| Buyer identity | Purchaser ID comes from the authenticated principal, never a request body. Library and order queries are scoped to that ID. |
| IDOR / private access | Every download requires a PAID purchase for the requested product; the requested release must belong to that same product and be published. ADMIN can download drafts for review. |
| Payment tampering | Purchase accepts only the product ID. The amount comes from the stored product and is saved as the order's immutable price snapshot. Product orders cannot be read, checked out or verified through the public guest invoice endpoints. |
| Duplicate checkout | User/product rows serialize purchase requests; already-owned products return ownership and pending orders are reused. Gateway payment-row locks preserve callback idempotence. |
| Paid access | Only server verification codes 100/101 plus a reference, or a server-authorized zero-price product, create PAID access. Callback Status=OK alone never grants downloads. |
| Upload validation | ZIP suffix and actual ZIP signature/structure checked; compressed size <=8 MB; expanded content <=100 MB; <=3,000 entries; duplicate/unsafe paths rejected. Archives are never extracted to disk or executed on the server. |
| Version integrity | Unique product/version pair, immutable bytes, SHA-256 fingerprint, explicit reviewed-release publication. |
| XSS / redirects | Product text is escaped before DOM insertion; descriptions/notes are plain text. Demo URLs require HTTPS. Payment redirects accept only the fixed Zarinpal origin and authority path. Post-login return paths are limited to product routes. |
| Download handling | Authenticated fetch with Bearer JWT, attachment-only `application/octet-stream`, `nosniff`, `no-store`, no token in download URLs. Server-generated filename from validated slug/version. |
| Abuse controls | 12 authorized downloads per account per minute, enforced under a database user lock. Request and verification retries have a 5-second per-payment cooldown. |
| Audit | Authorized downloads record account, product, release and time; records describe authorization, not confirmation that the client received all bytes. |

The application uses stateless Bearer authorization rather than cookie sessions for protected API actions. Adding cookie authentication in the future requires revisiting CSRF protection. Multiple app instances share the download limit through PostgreSQL locks and audit records.

The review follows the relevant principles in the [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) and inspects authorization, price/identity sources, file isolation, upload limits and escaped frontend rendering. This is a source-level security review, not a completed penetration test or a guarantee of vulnerability-free operation. ZIP structure checks do not scan malware inside a legitimate archive; publishers must review files before publication. Anti-malware scanning is not bundled. Apply your normal PostgreSQL backups and audit-retention policy.

Per user instruction, no automated tests, penetration traffic or real payment were executed. JavaScript syntax and patch whitespace were checked. Java compilation/runtime checks remain unverified in this environment because the existing Spring Boot parent cannot be resolved from Maven Central here.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/products/public?page=0` | Published catalog, 12 per page |
| GET | `/api/products/public/{slug}` | Published product and release metadata |
| GET / POST | `/api/products/admin` | Admin catalog / create draft |
| GET / PUT | `/api/products/admin/{id}` | Admin detail / update |
| POST | `/api/products/admin/{id}/releases` | Multipart `version`, `changelog`, `file` |
| PUT | `/api/products/admin/{id}/releases/{releaseId}` | `{published: true/false}` |
| POST | `/api/products/{id}/purchase` | Authenticated single-product checkout |
| GET | `/api/products/mine?page=0` | Current buyer's paid products |
| GET | `/api/products/orders?page=0` | Current buyer's orders, 20 per page |
| POST | `/api/products/orders/{id}/verify` | Retry own order verification |
| GET | `/api/products/{id}/releases/{releaseId}/download` | Authorized attachment and SHA-256 header |


## Product presentation and admin tools

The detail page uses a two-column product hero, full cover, latest-release facts, a sticky purchase panel, section navigation, feature highlights, installation guidance and expandable release notes. Text is escaped and demo/payment URL validation remains in place.

The admin panel includes server-side search and publication filters, global product/release counters, cover previews on cards, direct cover upload with the existing validated image API, and quick publish/unpublish actions. Uploaded covers remain reusable media assets if editing is cancelled. New `features`/`featuresEn` columns use the existing PostgreSQL schema-update configuration. Admin statistics and search routes require ADMIN; account pages continue to use principal-scoped APIs for every order and download.

## Product reviews and detail tabs

- Catalog and detail covers use `object-fit: contain` so the entire image stays visible in a consistent frame.
- Overview, features, setup, releases and reviews use accessible tabs with a single visible panel; selection does not navigate to an anchor or scroll the page. Arrow keys, Home and End select tabs.
- Public reviews are paginated (10 per page) with a real average rating and count. A verified paid/free purchase is required to submit a rating from 1–5 and plain text up to 3000 characters. Each account can have one review per product, submit it once, with no buyer update or delete endpoint. Public responses do not contain usernames or user IDs.
- Review ownership is resolved from the authenticated principal. Writes serialize on the user row and enforce a database uniqueness constraint. Review text is escaped in both public and admin UI. Administrators can inspect paginated reviews and hide them from product management; moderation checks that the review belongs to that product and preserves the unique record, preventing a second submission.
- New JPA entity `product_reviews` follows the existing Hibernate schema update workflow (`JPA_DDL_AUTO=update`). For externally managed schemas, provision the equivalent table, uniqueness constraint and index before rollout.
- Endpoints: `GET /api/products/public/{slug}/reviews`, authenticated `GET/POST /api/products/{id}/review`, admin `GET /api/products/admin/{id}/reviews` and `DELETE /api/products/admin/{id}/reviews/{reviewId}`.
- Validation for this change: JavaScript syntax and whitespace checks only. No automated tests or live payment tests were run; application runtime verification remains unavailable because the Maven parent dependency cannot be resolved in this environment.

## Invoice-first checkout and immutable reviews

- `POST /api/products/{id}/purchase` creates or reuses an unpaid order and returns its invoice path. It never requests a gateway authority or grants a new free entitlement.
- `/account/orders/{uuid}` renders the existing public site invoice template. Its data comes from authenticated owner-only order APIs. Resuming an order and payment callbacks lead to that exact invoice; normal login preserves this return path.
- Invoice terms show purchase/delivery, privacy/payment data, and account security/support. The checkbox starts unchecked. Checkout requires JSON `{accepted: true, termsVersion: "2026-10-09"}`; the server rejects missing/false consent and stale versions, and records acceptance time/version on the payment. This applies to direct invoices as well as product orders.
- Authenticated `GET /api/products/orders/{uuid}` displays the invoice, and `POST /api/products/orders/{uuid}/checkout` checks ownership, publication and consent before requesting payment. Price comes from the stored invoice. Free orders become PAID only after acceptance. Invoice detail and checkout responses use no-store.
- A product review is submitted only once through POST. Existing records return a conflict, including records hidden by an administrator. There is no user edit/delete endpoint. The form uses five keyboard-accessible star radio controls, not a dropdown.
- New schema fields: `payments.terms_accepted_at`, `payments.terms_version`, and `product_reviews.hidden` (default false). They follow the existing PostgreSQL/Hibernate schema update workflow; no migration framework was added.

## Policy pages and motion

Public `/terms` and `/privacy` pages use the shared site layout, explicit FA/EN copy, section navigation and authoritative reference links. Footer and invoice links expose both policies. Content describes current order, payment, review, account/browser storage and download behavior, with no invented retention, refund deadline or security certification. Consent version is now `2026-10-09`. Invoice consent and payment actions have explicit vertical spacing. Product tab transitions animate panel opacity, position and height while keeping only the selected panel visible and respecting reduced-motion settings. Validation: JS syntax and whitespace checks; no automated tests or live gateway calls.

## Two invoice types

- `DIRECT_LINK`: issued by administrators, with no product or purchaser reference. `/invoice/{uuid}` and its public APIs support viewing, payment and verification without login. Possession of the invoice link grants access. Admin UI exposes copy/share actions only for this type.
- `PRODUCT_PRIVATE`: created by the buyer’s authenticated purchase flow. `/account/orders/{uuid}` is a generic site shell; all invoice data and checkout/verification requests require the owner’s authenticated principal. Another account, including an administrator using the buyer-facing API, cannot access the invoice. Admin transaction reporting remains separate.
- Type and `shareable` metadata are derived from persisted ownership, never supplied by the client. A record with either product or purchaser set is rejected by public invoice APIs. Private invoice detail, checkout and verification responses use no-store. No schema migration is introduced.

## Admin removal

- `DELETE /api/products/admin/{id}` archives a product and stops publication/new checkout. Catalog, public reviews, admin search and counters exclude archived products. Published releases remain downloadable by existing verified buyers. Slugs and original files are retained with purchase history.
- `DELETE /api/payments/admin/transactions/{uuid}` archives an invoice. Admin lists hide it and public link access/new gateway requests stop. Confirmed entitlements, transaction reports and callback/reconciliation records are retained. An authority issued before removal can still settle at the gateway; callback verification must remain able to record that payment. An unpaid archived product order is shown as cancelled in the buyer’s orders and can only be verified if it already has an authority. A new purchase can create a fresh invoice.
- `products.deleted` and `payments.deleted` use PostgreSQL boolean defaults of false through the existing Hibernate update workflow. No migration framework is added.
- Deletion actions require ADMIN and an explicit UI confirmation. Ordinary read/navigation in generic CRUD management does not show load-progress or item-count success notifications.
- Validation: JS syntax/whitespace checks and source review. No automated tests or live payments were run.
