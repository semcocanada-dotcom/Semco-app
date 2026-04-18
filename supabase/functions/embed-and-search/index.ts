import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, match_count = 6 } = await req.json() as { query: string; match_count?: number };

    if (!query?.trim()) {
      return new Response(
        JSON.stringify({ error: 'query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Embed the installer's question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Semantic search over product TDS chunks
    const { data: chunks, error } = await supabase.rpc('match_product_embeddings', {
      query_embedding: embedding,
      match_threshold: 0.65,
      match_count,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ chunks: chunks ?? [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[embed-and-search]', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
