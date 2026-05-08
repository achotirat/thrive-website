# Thrive Website + Existing Sales Dashboard Integration Plan

## Summary

Use the existing `/Users/chotiratapiwattanapong/Document/Claude_cowork/PROJECTS/thrive-dashboard` project as the starting point for the sales dashboard, but evolve it before connecting the public Thrive website.

Current dashboard state:

- `thrive-app` is a Vite React dashboard deployed to Netlify.
- `thrive-api` syncs MySQL/RDS data into JSON snapshots.
- Production currently reads public `/data/*.json` files.
- Login is frontend-only shared-password logic.
- The dashboard is good as analytics v1, but not safe enough yet for live lead operations or broader staff access.

Recommended direction:

- Public site stays optimized for lead generation.
- Existing dashboard becomes the internal sales/marketing app.
- Lead capture is the first integration between the public site and dashboard.
- Patient portal remains out of scope.

## Key Changes

- Rebuild the dashboard foundation while preserving the useful existing modules:
  - Port the existing React dashboard UI into a Next.js dashboard app.
  - Keep the current KPI modules: overview, follow-up, new customers, churn risk, CLV, visit frequency, marketing ROI.
  - Replace frontend-only passwords with real authentication.
  - Add roles: admin, manager, sales rep, marketing.
  - Move all private customer data behind authenticated server routes.

- Fix security before any integration:
  - Rotate the RDS password currently documented in `PROJECT_LOG.md`.
  - Remove real credentials from project notes and docs.
  - Move all secrets to environment variables only.
  - Remove local private key files from the active project folder or store them securely outside the repo.
  - Stop exposing customer names, phone numbers, and CRM data through public static JSON files.

- Add a real lead-capture backend:
  - Create database tables for leads, lead events, assignments, notes, campaigns, sources, and status history.
  - Public website forms submit to a secure API endpoint.
  - Store name, phone, LINE ID, service interest, message, source page, UTM fields, referrer, and consent timestamp.
  - Dashboard shows new website leads in a lead inbox.
  - Staff can assign owner, update status, add notes, set follow-up date, and export CSV.

- Keep current PMS/RDS reporting as read-only:
  - Existing MySQL/RDS sync remains read-only.
  - Dashboard can still calculate retention, churn, CLV, and revenue reports from PMS data.
  - Do not write sales workflow data back into the PMS database unless Veritask or the PMS owner explicitly supports it.

- Public website integration:
  - First connect the current static homepage/contact forms to the new lead API.
  - Track CTA clicks for LINE, phone, form submit, and service-page interest.
  - Later migrate the public site to Astro + Sanity for content management and SEO scaling.
  - Sanity should manage marketing content only, not lead pipeline or customer records.

## Implementation Shape

- Dashboard app:
  - Next.js + React + Recharts.
  - Use the existing `thrive-app/src/ThriveDashboard.jsx` as the UI migration source.
  - Replace direct `/data/*.json` production reads with authenticated API calls.
  - Keep static JSON only for non-sensitive aggregate demo data, if needed.

- Backend/data:
  - Use Postgres for new sales workflow data.
  - Use existing RDS MySQL as read-only source for historical clinic/customer/revenue analytics.
  - Scheduled sync writes sanitized aggregates into dashboard storage, not public frontend files.
  - Lead API validates required fields and records attribution metadata.

- Auth:
  - Use Clerk or Supabase Auth.
  - Require login for all dashboard routes.
  - Use role-based permissions for modules and lead visibility.
  - Remove hardcoded passwords from frontend code.

- Deployment:
  - Keep current Netlify dashboard live as temporary analytics v1 during rebuild.
  - Deploy the evolved dashboard as a new protected app, preferably on Vercel.
  - Public website can remain static during lead API integration, then migrate to Astro/Sanity after lead capture is stable.

## Test Plan

- Security:
  - Confirm no credentials or private keys are present in tracked files.
  - Confirm customer JSON files are not publicly accessible.
  - Confirm unauthenticated users cannot access dashboard pages or APIs.

- Lead capture:
  - Submit leads from homepage, service pages, and contact page.
  - Verify required fields, consent timestamp, UTM fields, referrer, source page, and service interest are stored.
  - Verify duplicate phone/LINE ID handling.
  - Verify failed submissions show a user-friendly message and log server errors.

- Dashboard:
  - Test login/logout and role permissions.
  - Test lead inbox, assignment, status changes, notes, follow-up dates, filters, search, and CSV export.
  - Test existing analytics modules against current JSON/RDS-derived numbers.
  - Test mobile/tablet usability for sales reps.

- Sync/reporting:
  - Run PMS/RDS sync in a staging environment.
  - Verify no writes are made to the PMS database.
  - Verify reports load from private authenticated APIs.
  - Verify scheduled sync failure does not break dashboard login or lead workflow.

## Assumptions

- The existing dashboard should be evolved, not replaced.
- Lead capture is the first priority for the public website.
- The dashboard is internal-only and should not expose customer data publicly.
- No patient portal is included in this plan.
- The PMS/RDS database remains read-only for this project.
- Sales workflow data should live in a separate app database, not in Sanity and not directly in the PMS.
- Astro + Sanity remains the recommended future public-site stack, but only after the lead API/dashboard connection is stable.
