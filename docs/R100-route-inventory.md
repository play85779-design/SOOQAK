# SOOQAK — R100 route inventory and design checkpoint

28 Nov 2026. Current branch only; no publication.

## Navigation inventory
| Main destination | Existing routes | Acceptance |
|---|---|---|
| Home | home, listings, detail/:id, listing/:uuid (shared-detail) | Retain discovery and filter context; test scroll and deep links |
| Stores | stores, store/:id, merchant/:uuid (shared-store) | Connected stores first; local fixtures separate |
| Post | post | Three stages; no automatic publishing |
| Favorites | favorites | Connected first; retain device data separately |
| Account | account, auth, settings, about, my-ads, my-stores, my-store/:id, create-store | One sign-in and sign-out in main interface; retain recovery callback |
| Services | services, provider | Approved directory and one review flow |
| Communication | messages, notifications | Header shortcuts, one inbox |
| Onboarding | welcome, role | Preserve existing visitor flow; review duplication |
| Legacy test pages | cloud-test.html, shared-store.html | Keep isolated until all functionality and links migrate; no false commercial claims |

## Design directive
Use the Figma draft's layout discipline, not its unfinished flat visual design. Retain the existing approved logo until an explicit review, media-rich heroes, icons, gradients and color balance. Use varied container widths and densities according to content priority; do not reproduce a uniform list of large text boxes. Fixed branding and navigation on mobile, visible active parent route, appropriate desktop sidebar. Verify scroll restoration, avoid trapping the user and avoid duplicate history entries. Keep product photos and price at the center of marketplace pages. No paid service.

## Checkpoint rules
Every incremental implementation must record R-number, actual changed files, commit SHA, test evidence, acceptance limitations, and next steps in Drive and GitHub. Do not mark partial work complete or change the published preview until approval. Preserve data and working features. Do not embed credentials, personal data, or private Drive links in public code. Final visual concept and physical-device/live two-account tests remain open.
