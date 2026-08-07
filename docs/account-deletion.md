# In-app account deletion

The Profile tab exposes **Delete Account**. The user must type `DELETE` before
the destructive action is enabled. The mobile client invokes the authenticated
`delete-account` Edge Function; no service-role credential is present in the
app bundle.

## Server deletion order

1. Verify the caller's access token with Supabase Auth and derive the user ID
   from the verified Auth user, never from request data.
2. Insert `account_deletion_locks` for that user. Receipt Storage RLS denies
   access while this lock exists, preventing another device from uploading
   during deletion. Concurrent requests cannot take over an active lock; a
   retry can reclaim a lock only after its 15-minute stale timeout.
3. Recursively list and remove every object below `receipts/{user_id}/` through
   the Storage API, in batches of at most 1,000.
4. Hard-delete the Auth user with `auth.admin.deleteUser`. Foreign-key cascades
   remove the profile and all child, funding, expense, mileage, respite,
   appointment, monthly-claim, and custom-provider rows. The deletion lock also
   cascades away.
5. Clear the active-child ID, cached addresses, scheduled reminders, and local
   Auth session on the device.

If a step fails before Auth deletion, the server removes the deletion lock and
returns an error so the existing account can retry.

## Release order

The migration must be applied before the Edge Function and mobile build are
released:

1. Apply `supabase/migrations/*_make_user_owned_rows_cascade_on_account_delete.sql`.
2. Deploy `supabase/functions/delete-account` with JWT verification enabled
   (the default). Do not use `--no-verify-jwt`.
3. Test deletion with a non-review fixture account containing nested receipt
   files, then confirm the Auth user, owned database rows, deletion lock, and
   entire Storage prefix are gone.
4. Build and submit a new iOS binary.

Never test deletion using the App Review demo account unless it will be
re-created and independently verified before resubmission.
