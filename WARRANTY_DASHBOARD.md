# SEMCO Warranty Monitor

The warranty monitor is a separately hosted, owner-only web dashboard:

https://semco-warranty-monitor.co-me.chatgpt.site

It is deliberately outside the Expo Router `app/` tree, so no staff or dealer
screens are bundled into the installer-facing iOS or Android app. The
`warranty-dashboard` Edge Function is only a convenience redirect to the live
site.

## Access and data security

- The hosting layer is private to the site owner unless access is explicitly
  shared later.
- Inside the site, staff must also sign in to the same Supabase Auth project as
  Semco Pro.
- The interface requires an exact `admin_profiles` row with role `semco_admin`.
- The browser receives only the public Supabase client key. It never receives a
  service-role or secret key.
- Database RLS remains authoritative for profile, project, photo, and warranty
  queries.
- The Supabase client library is bundled with the site; no third-party CDN code
  can read the staff browser session.
- Project photos remain in the private `project-photos` bucket and are requested
  using five-minute signed URLs. Content already loaded by a browser may remain
  temporarily cached after the URL itself expires.
- Sessions use browser session storage and are cleared on sign-out. Each refresh
  revalidates the user and the `semco_admin` membership; revoked access clears
  protected data from the page.

## What it shows

- Installer company/contact profiles, certification, assigned supplier, and
  project counts.
- All visible projects with the latest warranty-review status.
- Six-stage warranty-photo completeness: substrate/prep, membrane/primer,
  scratch/base, finish, sealer, and final/handover.
- Private thumbnails and full-size photo review when the underlying storage
  object can be signed successfully.
- Search, status filters, manual refresh, and 60-second polling.

This first version provides monitoring controls only. It does not approve,
reject, edit, delete, or download warranty records. The current `semco_admin`
database role has broader backend permissions elsewhere, so this interface must
not be described as a separate database-enforced read-only role.

## Important evidence limitation

The dashboard reports files that have reached the Supabase cloud. It cannot see
photos that remain only on an installer's device or failed to sync. Working
photo rows can still be changed by the installer before a formal warranty
submission. A future warranty-decision release should add an immutable
submission manifest, server upload timestamps/checksums, reviewer IDs, decision
history, and post-submission photo locking before approval actions are enabled.

## Current production baseline

At launch, production contains four installer profiles, four projects, zero
project-photo rows, and zero warranty-review rows. The dashboard therefore shows
the profiles and projects immediately, while the photo gallery correctly starts
with “No warranty photos received yet.”
