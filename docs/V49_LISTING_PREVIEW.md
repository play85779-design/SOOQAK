# V49 — Read-only listing preview before publication
Date: 2026-11-21
- Adds a "معاينة الإعلان" action to the listing form without submitting the form.
- Previews title, category, city, final price wording, description + existing V43 specs, and cover photo when selected.
- Uses document.createElement and textContent for untrusted inputs; no DOM HTML injection.
- Reuses only browser-local object URLs and revokes on close; never uploads files until explicit publication.
- Form remains editable and standard validation remains unchanged. 2 new local Playwright tests.
