# V48 — Debounced text-only draft autosave
Date: 2026-11-21
When a verified seller creates a listing, the form now waits 1.8 seconds after the last input and saves a filtered draft to the existing private draft endpoint.
Only title, description, category, city, district, kind, price fields and category specifications are included; images and phone/WhatsApp numbers are excluded.
Closing the modal or submitting the listing cancels pending autosaves. Backend policy remains unchanged and server-side owner RLS still decides access.
The explicit "حفظ مسودة" control remains available; legacy draft load remains unchanged. Tests run with a fake local backend only.
