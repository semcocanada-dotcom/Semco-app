import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.103.3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_PUBLIC_KEY =
  Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
const GOOGLE_VISION_API_KEY = Deno.env.get('GOOGLE_VISION_API_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
}

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])
const MAX_BASE64_CHARACTERS = 14_000_000

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

  if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY || !GOOGLE_VISION_API_KEY) {
    console.error('receipt-ocr: required server environment is missing')
    return json({ error: 'OCR service unavailable' }, 503)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)
  const accessToken = authHeader.slice(7)
  const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken)
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  let body: { content?: unknown; mimeType?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid request' }, 400)
  }

  const content = typeof body.content === 'string' ? body.content : ''
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType.toLowerCase() : ''
  if (!content || content.length > MAX_BASE64_CHARACTERS || !/^[A-Za-z0-9+/]+={0,2}$/.test(content)) {
    return json({ error: 'Invalid or oversized receipt' }, 400)
  }
  if (!allowedMimeTypes.has(mimeType)) return json({ error: 'Unsupported receipt type' }, 400)

  const isPdf = mimeType === 'application/pdf'
  const visionRequest = isPdf
    ? {
        requests: [{
          inputConfig: { content, mimeType },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          pages: [1],
        }],
      }
    : {
        requests: [{
          image: { content },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
        }],
      }
  const endpoint = isPdf ? 'files:annotate' : 'images:annotate'

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/${endpoint}?key=${encodeURIComponent(GOOGLE_VISION_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visionRequest),
      },
    )
    if (!response.ok) {
      console.error(`receipt-ocr: Google Vision returned ${response.status}`)
      return json({ error: 'Receipt text recognition failed' }, 502)
    }
    const result = await response.json()
    const rawText = isPdf
      ? result.responses?.[0]?.responses?.[0]?.fullTextAnnotation?.text ?? ''
      : result.responses?.[0]?.fullTextAnnotation?.text ?? ''
    return json({ rawText: String(rawText).slice(0, 250_000) })
  } catch (error) {
    console.error('receipt-ocr failed', error instanceof Error ? error.message : 'Unknown error')
    return json({ error: 'Receipt text recognition failed' }, 502)
  }
})
