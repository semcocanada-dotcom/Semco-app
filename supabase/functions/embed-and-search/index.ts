// Retained only as a safe tombstone for older installed clients. The current
// Semco Pro mobile app performs all guide retrieval locally and never invokes
// this endpoint.
Deno.serve(() => new Response(
  JSON.stringify({ error: 'Remote guide retrieval has been disabled.' }),
  {
    status: 410,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  },
));
