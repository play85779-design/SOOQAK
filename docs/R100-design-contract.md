# SOOQAK R100 — Design contract (28 Nov 2026)

Status: editable visual direction created in Figma; not a released interface or final visual approval. No new paid service. Source of truth remains existing R100, repository, and private Drive. Do not copy owner account information or private design links into the public repository.

## Shared experience
- Arabic RTL. Existing fonts: Tajawal for body, Baloo Bhaijaan 2 for headings. Emerald #0A5945, deep #103F33, gold #E9C47B, violet #6B3CA4, paper #F4F7F5. Gold is an accent, not a replacement for accessible contrast.
- One persistent brand header, one five-item navigation bar, one login route, one logout location, one account center. Keep active section on child routes. No laboratory vocabulary in customer-facing copy except truthful limited-preview disclosures.
- Use actual product photographs; never represent illustrative items as real inventory. Photo slots in the Figma direction remain unapproved. Preserve existing brand assets until reviewed against the governing poster; no final logo change.
- No automatic migration or publication of local data; no commercial transaction in the limited test environment.

## Ten-screen reference
| Screen | Route | Core intent |
|---|---|---|
| Home | #home | Search, nine categories, hero and discovery |
| Search | #listings | Location and filters; explicit unsupported server fields |
| Detail | #detail/... or #listing/UUID | Media, price, owner controls, favorite, message, share |
| Post | #post | Images, details, review; explicit test/pledge consent |
| Stores | #stores / #merchant/UUID | Branded discovery and store products |
| Services | #services / #provider | Approved profiles and one review application |
| Favorites | #favorites | Connected saved items first; local drafts separately |
| Messages | #messages | One inbox and conversation |
| Account | #account | Identity, ads, stores and account controls |
| Settings | #settings | Optional district typed freely, privacy and password |

## Acceptance baseline
GitHub Actions run 46114456396 at commit 2b098bd90d5a4fa3174073a21c00c76101591d58 succeeded: 10 focused auth + 150 R100 shell + 96 Chromium + 36 V191 + 96 WebKit assertions = 388. This is an isolated browser regression baseline with simulated account data, not live two-account authorization, physical-device testing, or aesthetic acceptance.

Figma editable direction contains ten frames and reusable header, navigation, menu rows and action. Visual screenshot verification blocked by Starter MCP rate limit; no paid upgrade. This is a draft, not a replacement for the governing design poster. Do not publish or merge without completing remaining R100 acceptance and owner review. 
