import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.103.3'
import { runAccountDeletion } from '../_shared/accountDeletionOrchestrator.ts'
import { removeStoragePrefixRecursively } from '../_shared/storageCleanup.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_PUBLIC_KEY =
  Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, Allow: 'POST' },
    })
  }

  if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY || !SUPABASE_SERVICE_KEY) {
    console.error('delete-account: required Supabase environment is missing')
    return json({ error: 'Server not configured' }, 503)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)
  const accessToken = authHeader.slice(7)

  // Validate the caller against the Auth server. Never trust a user id from
  // the request body or unverified user_metadata/JWT payload fields.
  const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken)
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  let body: { confirmation?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid request' }, 400)
  }
  if (body.confirmation !== 'DELETE') return json({ error: 'Confirmation required' }, 400)

  // This client exists only inside the Edge Function. The service-role secret
  // is never returned to, embedded in, or accepted from the mobile client.
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const lockToken = crypto.randomUUID()

  try {
    await runAccountDeletion({
      // The Storage RLS policy consults this row, so another signed-in device
      // cannot upload a new object between cleanup and Auth deletion.
      lockAccount: async () => {
        const requestedAt = new Date().toISOString()
        const { error: insertError } = await admin
          .from('account_deletion_locks')
          .insert({ user_id: user.id, lock_token: lockToken, requested_at: requestedAt })
        if (!insertError) return
        if (insertError.code !== '23505') {
          throw new Error(`Could not lock account deletion: ${insertError.message}`)
        }

        // A previous runtime may have ended abruptly. Exactly one retry can
        // atomically take over a stale lock; a current concurrent request is
        // rejected rather than racing the same destructive operation.
        const staleBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString()
        const { data: claimedLock, error: claimError } = await admin
          .from('account_deletion_locks')
          .update({ lock_token: lockToken, requested_at: requestedAt })
          .eq('user_id', user.id)
          .lt('requested_at', staleBefore)
          .select('user_id')
          .maybeSingle()
        if (claimError || !claimedLock) throw new Error('Account deletion is already in progress')
      },
      removeReceiptFiles: async () => {
        await removeStoragePrefixRecursively(admin.storage.from('receipts'), user.id)
      },
      // The schema's ON DELETE CASCADE relationships remove the profile and
      // every owned relational row in the Auth deletion transaction.
      deleteAuthUser: async () => {
        const { error } = await admin.auth.admin.deleteUser(user.id, false)
        if (error) throw new Error(`Could not delete Auth user: ${error.message}`)
      },
      unlockAccount: async () => {
        const { error } = await admin
          .from('account_deletion_locks')
          .delete()
          .eq('user_id', user.id)
          .eq('lock_token', lockToken)
        if (error) throw error
      },
      onUnlockError: () => console.error('delete-account: could not release deletion lock'),
    })

    return json({ deleted: true })
  } catch (error) {
    console.error('delete-account failed', error instanceof Error ? error.message : error)
    return json({ error: 'Account deletion failed' }, 500)
  }
})
