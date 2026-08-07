const RESPONSE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
} as const;

// Retained only as a deployment-safe tombstone for installations where the
// former endpoint may still exist. It does not authenticate, read app data,
// contact an email provider, or write submission records.
Deno.serve(() =>
  new Response(
    JSON.stringify({
      error: 'This endpoint is disabled. Autism Fund Tracker does not send government submissions.',
    }),
    { status: 410, headers: RESPONSE_HEADERS },
  ),
);
