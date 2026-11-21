# V47 — Safe image previews and upload order
Date: 2026-11-21
- Up to 5 new images including already-attached cloud images; accepts only JPEG/PNG/WEBP and rejects over 12MB before upload.
- Preview photos appear in an accessible card with reorder controls; the first photo is used as cover.
- Both local and cloud publish read the selected sorted file array, not the original FileList order.
- Object URLs are revoked each refresh/close; browser does not upload until publish.
- Existing server JPEG resize/1.5MB validation and uploaded-image reorder unchanged.
- No production/Supabase changes.
