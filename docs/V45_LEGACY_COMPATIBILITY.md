# V45: backward compatibility regression
Date: 2026-11-21 (Asia/Riyadh)
- Includes nine legacy fixture listings, one per original category, lacking subcategory fields.
- Verifies listing display under all nine original canonical parent categories.
- Verifies new V42 subcategory filtering does not break old records, using title/description fallback.
- Verifies category names are never mutated through browsing/reset.
- Tests are local and simulated; production data and Supabase DB remain untouched.
