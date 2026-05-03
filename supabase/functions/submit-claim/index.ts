import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY     = Deno.env.get('RESEND_API_KEY') ?? ''
const GOVT_EMAIL         = Deno.env.get('GOVT_EMAIL') ?? 'autismif@gov.sk.ca'
const FROM_EMAIL         = Deno.env.get('FROM_EMAIL') ?? 'Autism Fund Tracker <noreply@semco.ca>'
const SUPABASE_URL       = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClaimExpense {
  id: string
  expense_date: string
  description: string | null
  category: string
  provider_name: string | null
  amount: number
}

interface ClaimMileage {
  id: string
  trip_date: string
  description: string | null
  distance_km: number
  rate_per_km: number
  reimbursement_amount: number
}

interface SubmitClaimPayload {
  child_id: string
  child_name: string
  child_health_card: string | null
  funding_year_id: string
  month: string         // 'YYYY-MM'
  month_label: string   // 'March 2025'
  expenses: ClaimExpense[]
  mileage: ClaimMileage[]
  total_amount: number
  parent_full_name: string
  parent_email: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: corsHeaders,
      })
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 503, headers: corsHeaders,
      })
    }

    // Verify caller is authenticated
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: corsHeaders,
      })
    }

    const payload: SubmitClaimPayload = await req.json()

    // Verify the child belongs to this user
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id')
      .eq('id', payload.child_id)
      .eq('parent_id', user.id)
      .single()

    if (childError || !child) {
      return new Response(JSON.stringify({ error: 'Child not found' }), {
        status: 403, headers: corsHeaders,
      })
    }

    const html = buildEmailHtml(payload)
    const subject = `ASD-IF Expense Claim — ${payload.child_name} — ${payload.month_label}`

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [GOVT_EMAIL],
        cc: payload.parent_email ? [payload.parent_email] : [],
        subject,
        html,
      }),
    })

    const resendData = await resendRes.json()

    if (!resendRes.ok) {
      console.error('Resend error:', resendData)
      return new Response(JSON.stringify({ error: resendData?.message ?? 'Email send failed' }), {
        status: 502, headers: corsHeaders,
      })
    }

    // Record submission
    await supabase.from('monthly_claims').upsert({
      child_id: payload.child_id,
      funding_year_id: payload.funding_year_id,
      month: payload.month,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      total_amount: payload.total_amount,
      expense_ids: payload.expenses.map((e) => e.id),
      mileage_ids: payload.mileage.map((m) => m.id),
      expense_count: payload.expenses.length + payload.mileage.length,
      resend_message_id: resendData.id ?? null,
    }, { onConflict: 'child_id,month' })

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('submit-claim error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: corsHeaders,
    })
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

function buildEmailHtml(p: SubmitClaimPayload): string {
  const expenseRows = p.expenses.map((e) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${e.expense_date}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${e.provider_name ?? '—'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${formatCategory(e.category)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${e.description ?? '—'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3;text-align:right">$${e.amount.toFixed(2)}</td>
    </tr>`).join('')

  const mileageRows = p.mileage.map((m) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${m.trip_date}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">—</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">Mileage</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3">${m.description ?? ''} (${m.distance_km} km @ $${m.rate_per_km}/km)</td>
      <td style="padding:8px 10px;border-bottom:1px solid #E8E4F3;text-align:right">$${m.reimbursement_amount.toFixed(2)}</td>
    </tr>`).join('')

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
      <tr><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3;width:40%"><strong>Child Name</strong></td><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3">${p.child_name}</td></tr>
      ${p.child_health_card ? `<tr><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3"><strong>Health Card</strong></td><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3">${p.child_health_card}</td></tr>` : ''}
      <tr><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3"><strong>Claim Month</strong></td><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3">${p.month_label}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3"><strong>Parent/Guardian</strong></td><td style="padding:12px 16px;border-bottom:1px solid #E8E4F3">${p.parent_full_name}</td></tr>
      <tr><td style="padding:12px 16px"><strong>Submitted</strong></td><td style="padding:12px 16px">${new Date().toLocaleDateString('en-CA')}</td></tr>
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
      <tbody>
        ${expenseRows}${mileageRows}
      </tbody>
      <tfoot>
        <tr style="background:#F3F0FF">
          <td colspan="4" style="padding:14px 10px;text-align:right;font-weight:700;font-size:15px">Total Claim:</td>
          <td style="padding:14px 10px;text-align:right;font-weight:800;font-size:17px;color:#7C5CFC">$${p.total_amount.toFixed(2)}</td>
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
