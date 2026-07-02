# Database migrations (Supabase)

The Supabase database is **not** managed by CI or by any deploy step. Committing
a change to `supabase/*.sql` updates the repo only — the live database keeps its
old shape until someone applies the SQL by hand.

## Why this matters

The Netlify `leads` function (`netlify/functions/leads.js`) builds every insert
from a fixed field list (`ALLOWED_FIELDS`) and writes all of those columns on
**every** submission — quiz and plain contact forms alike, even when a value is
`null`. PostgREST rejects the whole insert if the payload names any column the
live table doesn't have, returning:

```
502  { "ok": false, "error": "Could not save lead" }
```

and logging (in the Netlify function logs) the real reason:

```
PGRST204  Could not find the 'X' column of 'leads' in the schema cache
```

So a column that exists in `supabase/leads_schema.sql` but was never applied to
production takes down **all** lead capture, not just the feature that added it.

## Checklist when you change `supabase/leads_schema.sql`

1. Edit `supabase/leads_schema.sql` and commit as usual.
2. Open the Supabase Dashboard → project `ajotuopgziygjpgvrtjg` → **SQL Editor**.
3. Paste the **entire** `leads_schema.sql` and click **Run**. The file is
   idempotent (`create ... if not exists`, `add column if not exists`,
   `create or replace`), so re-running it only fills in what the live table is
   missing and never touches existing rows.
4. The file ends with `notify pgrst, 'reload schema';` which forces PostgREST to
   pick up new columns immediately.
5. Submit a real test lead (quiz + a service-page contact form) and confirm it
   redirects to `/thank-you`.

## Debugging a 502 from `/api/leads`

- Netlify → project `thrive-website` → **Logs → Functions → `leads`** shows the
  structured `Supabase insert failed` line with the PostgREST `code`/`message`.
- To surface the reason in the API response temporarily, set the Netlify env var
  `LEAD_DEBUG_ERRORS=1` (leave it unset in normal production). The function then
  includes `code` and `detail` in the 502 body. Unset it again once diagnosed.
