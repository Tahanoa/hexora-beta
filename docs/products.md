# Digital products and private downloads

## Workflow

1. Configure the existing Zarinpal gateway at `/manage/payments`.
2. Create a draft at `/manage/products`: permanent slug, FA/EN titles, descriptions and per-line feature highlights, category, an image cover (upload with preview inside the editor or choose from the media library), requirements/installation instructions, optional HTTPS demo and whole-toman price. Price zero means free; paid products require at least 1,000 toman.
3. Upload a ZIP release up to 8 MB with a unique version label and changelog. Releases start as drafts. Download and review it before using “Reviewed; publish release”. File bytes cannot be replaced; upload a new version for changes.
4. Edit the product and enable publication. A product cannot be published until it has a published release. Withdrawing the last published release automatically removes the product from the catalog.
5. Buyers open `/products`, sign in/register, purchase one product and pay through the existing Zarinpal gateway. After successful login, the app safely returns to the requested product page. Gateway callbacks verify server-side and return product buyers to `/account/orders`.
6. The user dashboard at `/account` has separate pages: `/account/products` for purchased products/releases and `/account/orders` for payment status, references, checkout recovery and verification. `/products/library` redirects to the new purchases page. Normal users enter their dashboard from the website account link and after login; `/dashboard` also routes normal users there. Existing buyers retain downloads of published releases when the product is hidden from the public catalog. Purchase includes access to subsequent published versions; there is no expiry/licensing in this stage.

Free products create a PAID, zero-value order with reference FREE without calling the gateway. These count as purchases in the existing sales metrics, with zero revenue. Catalog prices changing do not change the amount of a previously initiated pending order.

## Storage and schema

PostgreSQL only, using the project's existing `JPA_DDL_AUTO=update`. New tables: `products`, `product_releases`, `product_private_files`, `product_downloads`. Payments gain nullable product/purchaser IDs, request/verification cooldown timestamps, and a composite ownership index. Deployments using `validate` must provision the entity schema first.

File bytes are PostgreSQL `bytea` in `product_private_files`; they are not stored in the media table or static web directory. Version metadata and file bytes are separate, so catalog/library responses never serialize binary data. Covers use the existing validated public image-media flow. No new gateway credentials or external storage service is needed.

No product/file hard-delete endpoint is provided: draft/unpublish and release withdrawal preserve paid-order history.

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
