# SOOQAK — Session 12 handoff / ريليف المحادثة الجديدة
**Date:** 2026-11-24, Asia/Riyadh. **Status:** Handoff only. No production, DB, Auth or payment changes.

## Start here
Read the complete current handoff in Google Drive: https://docs.google.com/document/d/1whMX7gdZrHnCtrD8D96Rx5__iVDsNBp1tljp7Y3V7y8/edit
Do not assume this Markdown or that Doc is up to date without live GitHub + Sheets checks.

## Verified 2026-11-24
- Repository: https://github.com/play85779-design/SOOQAK
- Latest visual fix **V104**: `fix/sooqak-v104-detail-favorites-preview-20261124`
- Latest V104 SHA: `4cef0e3234b8a26ba8f84bba172016601c89608a`
- Open **Draft PR52**, not merged: https://github.com/play85779-design/SOOQAK/pull/52
- `main` SHA unchanged: `01f6e01e28501739b6180dcfa2757cbf37b062c8`
- Base `develop/v38-recovery`: `b03d45d22695b53c5321f22003441ec21e6e2fc7`
- Quality CI SHA 4cef0e3… completed SUCCESS incl **202/202 Playwright tests** and fixtures: https://github.com/play85779-design/SOOQAK/actions/runs/45323509095
- CodeQL and Gitleaks success, CodeQL says "No new alerts in code changed by this pull request" (not a full security certification).
- V104 isolated preview **READY**: https://sooqak-v101-public-showcase-foejzul2a-play85779-5487.vercel.app/
- Vercel deployment: `dpl_ETP13DXQLtXJnbc6F7GNEVVaSEV7`
- Latest open PRs at handoff: #38,#39,#41,#43,#44,#45,#46,#47,#48,#49,#50,#51,#52; do not merge without approval.

## Visual releases / what they do
- V101 PR49: native SVG prototype from visual governing poster.
- V102 PR50: poster-fidelity improvements, country flags, country->region->optional city, colors and cards.
- V103 PR51: clickable 3-step listing wizard, local images, details and preview; a demo auth page.
- **V104 PR52**: fix huge location pin SVG in product detail; bounded photo gallery and interactive thumbnails (one source image for each sample listing); synchronized saved/unsaved heart (filled and labeled); login/signup entry in header and interactive *demo* auth tabs; demo messaging page. Requested Vercel preview toolbar off; must verify on actual user device.

## Explicit unfinished product work
Real login/signup/email verification/password reset, secure return URLs, Supabase Auth/Storage/RLS, real listing submission, personal My Ads, messaging and merchant storefront are NOT live on showcase. All demo content is labeled. Country/region/city dataset incomplete. Design not fully visually approved on Fold. WhatsApp sharing and preview Toolbar removal need second-device checks.

## Approved governing guidelines
- Governing poster: https://drive.google.com/file/d/1zSnPB8Ld16cRz5KJigPam9FSX-drvYJj/view
- Arabic RTL, vibrant green/orange but balanced; clear images, typography, mobile-first, no excessive empty cards. No fake ratings or publish-success. Each visible control either works or clearly explains unavailability.
- Design policy file: `docs/handoffs/SOOQAK_V103_OWNER_GUIDELINE_2026-11-24.md` in the V103 branch.
- 200 items master: https://docs.google.com/spreadsheets/d/1RKlSs77CvaS81jACLT_MmGUvbL-dXNhBXNXXsYwSgfQ/edit
- Administrative tracker: https://docs.google.com/spreadsheets/d/1iKb33MQAjhxOt-TiM1iqQjBGaCs9dz_clAF-afLEKtY/edit
- Previous detailed V103/V104 minutes: https://docs.google.com/document/d/1aBV0nujMpeKridJbR11s6GOJmYgfFsm2Od6vVZ6UJdU/edit

## Next action / release gates
1. Recheck live GitHub PR52 SHA and workflow status and preview deployment.
2. Test image/pin size, galleries and heart on 330/390/790/1180 and real Fold, Vercel toolbar from an external browser, and WhatsApp OG.
3. Record individual visual findings against 200-list, close only with evidence and user acceptance.
4. Audit existing Auth/RLS and safe test environment; implement real flows in distinct reviewed PRs, never production by default.
5. Preserve every step in Drive, GitHub, master tracker, with time, SHA, PR and tests. Budget goal SAR 1000, no new paid subscriptions without explicit approval.
6. Proactively hand off long chats early; actual chat utilization percentage is not measurable. Never assert exactly 90%.

**This is continuity documentation only**, not a merge, deployment or evidence of full marketplace readiness.
