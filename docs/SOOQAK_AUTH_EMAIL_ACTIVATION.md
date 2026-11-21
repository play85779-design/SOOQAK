# SOOQAK | Email authentication activation — V40 (2026-11-21)

**Status: blocked on SMTP configuration and verified delivery.** Do not disable email confirmation, delete accounts, purchase a service or change production automatically.

## Root cause
- Live Auth logs showed `mail.send` events and the sender `noreply@mail.app.supabase.io`. This is a delivery hand-off attempt, not proof that messages reached Hotmail.
- Supabase's shared/default email provider is restricted to organization-member addresses and 2 emails per hour. It is for development only.
- The connected Resend account has no verified sending domains.
- Site login's `window.SOOQAK_AUTH_MAIL_READY` stays false, displaying clear guidance until verified; code does not claim to have sent/received email.

## One-time manual activation after obtaining a domain already controlled by the owner
1. Verify sender-domain ownership, DKIM, SPF and DMARC in Resend or another SMTP provider. No purchase is authorized.
2. Set sender, SMTP host, port, user and password in [Supabase SMTP Settings](https://supabase.com/dashboard/project/zwbtiyqgrgjybwaguuyn/auth/smtp). Never share SMTP secrets in messages, screenshots, source code or Drive.
3. Keep **Confirm Email** enabled.
4. Add the **exact current preview URL ending in /index.html** to [Supabase Auth URL Configuration](https://supabase.com/dashboard/project/zwbtiyqgrgjybwaguuyn/auth/url-configuration). Do not change the production Site URL without permission.
5. Test using two safe, user-controlled test accounts: (a) signup/confirmation email delivered (b) password login (c) reset email received (d) shared-link redirect opens preview (e) seller posts listing, buyer messages, seller marks sold, 1% ledger reflects sale. No real money.
6. After and only after delivery verified, change the preview-only `SOOQAK_AUTH_MAIL_READY` to true and deploy a new preview.

**Do not invite customer email addresses into the Supabase organization as a workaround:** membership would grant unrelated privileges.

## Read-only checks
- [Supabase Auth logs](https://supabase.com/dashboard/project/zwbtiyqgrgjybwaguuyn/logs/auth-logs)
- [Supabase SMTP docs](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
