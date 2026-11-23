# SOOQAK V57 — Arabic password recovery / development only

## Why
The user reported a Supabase-branded English reset email and the email link landing in the sign-in experience rather than a password reset form. A static Arabic recovery email template already exists in `auth-email-templates/recovery.html`, but **the server-side template is not enabled or live-tested**.

## This change
- Adds `reset-password.html` and `reset-password.mjs` with an RTL SOOQAK-branded form, read-only account email, new password + confirmation, accessible failure and success messages.
- Keeps the existing reset email callback `/index.html` for compatibility with current redirect allowlisting; when the existing callback contains `type=recovery`, the browser navigates immediately, on the same origin, to `/reset-password.html` with the callback fragment/query intact. Supabase processes the callback only on the destination.
- The reset UI remains disabled until `PASSWORD_RECOVERY` is emitted with a session, then `auth.getUser()` verifies the authenticated user. Merely appending `?type=recovery` to a logged-in URL cannot unlock a password change.
- On submit, another `auth.getUser()` must match the original recovery user, and `updateUser({password})` is called exactly once. The page attempts to sign out and links to the normal password login.
- The URL is cleaned only after the Auth client has verified the session. The code does not log, persist, or include recovery tokens in another origin's URL.
- Adds isolated Playwright tests. No live Supabase requests occur during tests, no migrations, no production deploy, and no email traffic.

## Live-test gate — still pending
1. Confirm Supabase Auth > URL Configuration allows the **existing exact test origin `/index.html`** and does not fall back to an unrelated Site URL. Do not change the production Site URL without approval.
2. Enable and verify the existing branded Arabic recovery template **in Supabase**, using a sender/SMTP verified at zero new cost, if available. The local HTML file alone does not modify a provider.
3. After a protected preview deployment, send **one** reset link to a controlled test account, confirm opening on an actual phone (including in-app browser), set new password, log out, and log back in. Never paste recovery tokens or passwords into bug reports.
4. Cover expiry, replay, cross-account sessions, and Arabic rendering. Until verified, V57 is **partial**, not production-ready.

## Isolation
Branch: `develop/v57-recovery-safe-route-nov23`; target: `develop/v38-recovery` only. Do not auto-merge while branch protection is not confirmed. Never merge into main or release to production without the owner's launch approval.
