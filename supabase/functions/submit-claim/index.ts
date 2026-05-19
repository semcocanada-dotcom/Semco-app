import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY       = Deno.env.get('RESEND_API_KEY') ?? ''
const GOVT_EMAIL           = Deno.env.get('GOVT_EMAIL') ?? 'autismif@gov.sk.ca'
const FROM_EMAIL           = Deno.env.get('FROM_EMAIL') ?? 'Autism Fund Tracker <noreply@semco.ca>'
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

// The client only supplies identifiers. All content emailed to the
// government (health card number, line items, amounts) is re-derived
// from the database under the caller's verified ownership — the client
// is never trusted to provide the values themselves.
interface SubmitClaimPayload {
  child_id: string
  funding_year_id: string
  month: string         // 'YYYY-MM'
  month_label: string   // 'March 2025'
  expense_ids: string[]
  mileage_ids: string[]
}

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const MONTH_RE = /^\d{4}-\d{2}$/
const isUuid = (s: unknown): s is string =>
  typeof s === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return json({ error: 'Server not configured' }, 503)
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.slice(7))
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    const payload = (await req.json()) as SubmitClaimPayload
    if (
      !isUuid(payload.child_id) ||
      !isUuid(payload.funding_year_id) ||
      typeof payload.month !== 'string' || !MONTH_RE.test(payload.month) ||
      !Array.isArray(payload.expense_ids) || !payload.expense_ids.every(isUuid) ||
      !Array.isArray(payload.mileage_ids) || !payload.mileage_ids.every(isUuid)
    ) {
      return json({ error: 'Invalid request' }, 400)
    }

    // Ownership: child must belong to the caller.
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, name, health_card_number')
      .eq('id', payload.child_id)
      .eq('parent_id', user.id)
      .single()
    if (childError || !child) return json({ error: 'Not found' }, 403)

    const { data: profile } = await supabase
      .from('profiles').select('full_name').eq('id', user.id).single()

    // Re-derive line items from the DB, scoped to the owned child and the
    // requested year. Client-supplied ids only narrow the selection.
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id, expense_date, description, category, amount, providers(name)')
      .eq('child_id', child.id)
      .eq('funding_year_id', payload.funding_year_id)
      .in('id', payload.expense_ids.length ? payload.expense_ids : ['00000000-0000-0000-0000-000000000000'])

    const { data: mileage } = await supabase
      .from('mileage_logs')
      .select('id, trip_date, description, distance_km, rate_per_km, reimbursement_amount')
      .eq('child_id', child.id)
      .eq('funding_year_id', payload.funding_year_id)
      .in('id', payload.mileage_ids.length ? payload.mileage_ids : ['00000000-0000-0000-0000-000000000000'])

    const exp = expenses ?? []
    const mil = mileage ?? []
    if (!exp.length && !mil.length) return json({ error: 'Nothing to submit' }, 400)

    const total =
      exp.reduce((s, e) => s + Number(e.amount), 0) +
      mil.reduce((s, m) => s + Number(m.reimbursement_amount), 0)

    // Email goes to the government and (optionally) the caller's own
    // verified account email — never a client-supplied address.
    const cc = user.email ? [user.email] : []
    const html = buildEmailHtml({
      childName: child.name,
      healthCard: child.health_card_number,
      monthLabel: payload.month_label,
      parentName: profile?.full_name ?? '',
      expenses: exp,
      mileage: mil,
      total,
    })

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [GOVT_EMAIL],
        cc,
        subject: `ASD-IF Expense Claim — ${child.name} — ${payload.month_label}`,
        html,
      }),
    })
    const resendData = await resendRes.json().catch(() => ({}))
    if (!resendRes.ok) {
      console.error('Resend error:', resendData)
      return json({ error: 'Email send failed' }, 502)
    }

    await supabase.from('monthly_claims').upsert({
      child_id: child.id,
      funding_year_id: payload.funding_year_id,
      month: payload.month,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      total_amount: total,
      expense_ids: exp.map((e) => e.id),
      mileage_ids: mil.map((m) => m.id),
      expense_count: exp.length + mil.length,
      resend_message_id: resendData.id ?? null,
    }, { onConflict: 'child_id,month' })

    return json({ success: true, id: resendData.id ?? null })
  } catch (err) {
    console.error('submit-claim error:', err)
    return json({ error: 'Internal error' }, 500)
  }
})

function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    aba_ibi: 'ABA/IBI',
    speech_language: 'Speech-Language',
    occupational_therapy: 'Occupational Therapy',
    physical_therapy: 'Physical Therapy',
    psychology: 'Psychology',
    respite: 'Respite',
    swimming: 'Swimming',
    social_skills: 'Social Skills',
    music_therapy: 'Music Therapy',
    art_therapy: 'Art Therapy',
    assistive_technology: 'Assistive Technology',
    other: 'Other',
  }
  return map[cat] ?? cat
}

// deno-lint-ignore no-explicit-any
function buildEmailHtml(p: any): string {
  const expenseRows = p.expenses.map((e: any) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${esc(e.expense_date)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${esc(e.providers?.name ?? '—')}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${esc(formatCategory(e.category))}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${esc(e.description ?? '—')}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3;text-align:right">$${Number(e.amount).toFixed(2)}</td>
    </tr>`).join('')

  const mileageRows = p.mileage.map((m: any) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${esc(m.trip_date)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">—</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">Mileage</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${esc(m.description ?? '')} (${Number(m.distance_km)} km @ $${Number(m.rate_per_km)}/km)</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3;text-align:right">$${Number(m.reimbursement_amount).toFixed(2)}</td>
    </tr>`).join('')

  const healthRow = p.healthCard
    ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3"><strong>Health Card</strong></td><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3">${esc(p.healthCard)}</td></tr>`
    : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8FF;font-family:Arial,Helvetica,sans-serif;color:#1E1B4B">
  <div style="max-width:680px;margin:0 auto;padding:32px 24px">
    <div style="background:linear-gradient(135deg,#9B6DFF,#7C5CFC);border-radius:12px;padding:24px;margin-bottom:24px">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">ASD-IF Monthly Expense Claim</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Saskatchewan Individualized Autism Funding</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3;width:40%"><strong>Child Name</strong></td><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3">${esc(p.childName)}</td></tr>
      ${healthRow}
      <tr><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3"><strong>Claim Month</strong></td><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3">${esc(p.monthLabel)}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3"><strong>Parent/Guardian</strong></td><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3">${esc(p.parentName)}</td></tr>
      <tr><td style="padding:12px 16px"><strong>Submitted</strong></td><td style="padding:12px 16px">${esc(new Date().toLocaleDateString('en-CA'))}</td></tr>
    </table>
    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
      <thead>
        <tr style="background:#F3F0FF">
          <th style="padding:12px 10px;text-align:left;font-size:13px;font-weight:600;color:#6B7280">Date</th>
          <th style="padding:12px 10px;text-align:left;font-size:13px;font-weight:600;color:#6B7280">Provider</th>
          <th style="padding:12px 10px;text-align:left;font-size:13px;font-weight:600;color:#6B7280">Category</th>
          <th style="padding:12px 10px;text-align:left;font-size:13px;font-weight:600;color:#6B7280">Description</th>
          <th style="padding:12px 10px;text-align:right;font-size:13px;font-weight:600;color:#6B7280">Amount</th>
        </tr>
      </thead>
      <tbody>${expenseRows}${mileageRows}</tbody>
      <tfoot>
        <tr style="background:#F3F0FF">
          <td colspan="4" style="padding:14px 10px;text-align:right;font-weight:700;font-size:15px">Total Claim:</td>
          <td style="padding:14px 10px;text-align:right;font-weight:800;font-size:17px;color:#7C5CFC">$${Number(p.total).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <p style="margin-top:24px;font-size:12px;color:#9CA3AF;text-align:center">
      Submitted via Autism Fund Tracker · Saskatchewan ASD-IF Program
    </p>
  </div>
</body>
</html>`
}
