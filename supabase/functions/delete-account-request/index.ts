const page = `SEMCO PRO — REQUEST ACCOUNT AND DATA DELETION

Semco Pro is operated by Semco Canada / Innovative Finishes Inc.

REQUEST DELETION WITHOUT THE APP

Email info@semcocanada.ca from the email address used for your Semco Pro account. Use the subject "Delete my Semco Pro account" and state that you want your account and associated app data permanently deleted.

We may reply only to verify account ownership before completing the request. You do not need to reinstall or open the app.

WHAT IS DELETED

After ownership is verified, Semco Pro permanently deletes the authentication account, installer profile, associated project and calculation records, private project photos and files, receipts, forms, signatures, material requests, warranty submissions, and Semco Pro data stored for that account.

TIMING

Verified requests are completed as soon as reasonably possible and no later than 30 days after verification. We will confirm completion by email. Data required to be retained for a legal, fraud-prevention, security, or regulatory obligation may be retained only for that purpose and for the required period.

DELETE IN THE APP

If you can sign in, open More > Account and Security > Delete Account. Type DELETE and confirm to permanently delete the account and associated app data immediately.

CONTACT

Email: info@semcocanada.ca
Phone: +1 (306) 530-7910
Support: https://www.semcocanada.ca/contact
Privacy policy: https://hriocefqjedalnaebeiw.supabase.co/functions/v1/privacy-policy
`;

Deno.serve(() => new Response(page, {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  },
}));
