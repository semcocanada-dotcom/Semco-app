import 'jsr:@supabase/functions-js@2/edge-runtime.d.ts';

const dashboardUrl = 'https://semco-warranty-monitor.co-me.chatgpt.site';

Deno.serve((request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD, OPTIONS' },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: dashboardUrl,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  });
});
