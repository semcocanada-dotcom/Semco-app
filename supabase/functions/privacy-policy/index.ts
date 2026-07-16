import '@supabase/functions-js/edge-runtime.d.ts';

const policy = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Semco Pro Privacy Policy</title>
  <style>
    :root { color-scheme: light; font-family: Arial, Helvetica, sans-serif; background: #F2F4F7; color: #00232D; }
    body { margin: 0; }
    main { width: min(760px, calc(100% - 32px)); margin: 32px auto; background: #FFFFFF; border: 1px solid #D8E2E5; border-radius: 8px; padding: clamp(24px, 5vw, 48px); box-sizing: border-box; }
    header { border-bottom: 4px solid #008E90; padding-bottom: 20px; margin-bottom: 28px; }
    h1 { margin: 0 0 8px; font-size: clamp(30px, 6vw, 44px); line-height: 1.08; }
    h2 { margin: 30px 0 10px; color: #CF451F; font-size: 21px; }
    p, li { font-size: 16px; line-height: 1.65; }
    ul { padding-left: 22px; }
    a { color: #008E90; font-weight: 700; }
    .updated { color: #52676D; margin: 0; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Semco Pro Privacy Policy</h1>
      <p class="updated">Last updated: July 15, 2026</p>
    </header>

    <p>Semco Canada operates the Semco Pro mobile application for professional installers. This policy explains what information the app collects, why it is used, how it is protected, and the choices available to installers and customers.</p>

    <h2>Information we collect</h2>
    <ul>
      <li>Installer account and company information, including name, business name, email, phone number, address, and postal code.</li>
      <li>Project information, including customer name and email, site address, surface details, colours, products, material estimates, job notes, and status.</li>
      <li>Stage photos, purchase receipts, signed project forms, customer signatures, warranty submissions, order requests, and reward progress.</li>
      <li>Ask Semco questions, recent conversation context, retrieved technical-document sections, and generated answers.</li>
      <li>Basic technical and security information needed to authenticate the account, operate cloud sync, and investigate errors or misuse.</li>
    </ul>

    <h2>How we use information</h2>
    <p>We use this information to provide project tracking, field documentation, material estimates and dealer requests, warranty review, signed customer records, receipt verification, reward-tier progress, account support, security, and installer guidance.</p>

    <h2>AI-assisted answers</h2>
    <p>Questions sent to Ask Semco may be processed by Google Firebase and Gemini services together with approved Semco technical sections. Customer names, addresses, project records, signatures, and project photos are not intentionally included in AI requests. Installers should not enter private customer information into Ask Semco.</p>

    <h2>Storage and service providers</h2>
    <p>Semco Pro uses Supabase for account authentication, database records, and access-controlled file storage. It uses Google Firebase services for AI-assisted technical answers. These providers process information for Semco Canada under their own security and privacy obligations. Semco does not sell personal information.</p>

    <h2>Who can access records</h2>
    <p>Installers can access their own account and project records. Authorized Semco Canada administrators can review installer, project, warranty, receipt, reward, and order records. An assigned dealer may access only the information needed to review and fulfill material requests for installers assigned to that dealer.</p>

    <h2>Retention</h2>
    <p>Active account and project records are retained while needed to provide the app and administer warranties, orders, and rewards. Deletion requests are normally completed within 30 days. Signed contracts, warranty evidence, transaction records, or other records may be retained longer where required for legal, accounting, fraud-prevention, dispute, or warranty obligations.</p>

    <h2>Security</h2>
    <p>Semco uses authenticated accounts, row-level database controls, private storage, time-limited file links, and administrative access controls. No online service can guarantee absolute security, so installers should protect their passwords and report suspected unauthorized access.</p>

    <h2>Your choices</h2>
    <p>Installers can edit their company profile, reset their password, and start account deletion from <strong>More &gt; Account and Security</strong> in the app. Requests to access or correct personal information can also be sent to the contact below.</p>

    <h2>Children</h2>
    <p>Semco Pro is a professional trade application and is not directed to children under 13.</p>

    <h2>Changes to this policy</h2>
    <p>We may update this policy as the app or applicable requirements change. The current version and update date will remain available at this URL.</p>

    <h2>Contact</h2>
    <p>Semco Canada<br>Email: <a href="mailto:semcocanada@gmail.com">semcocanada@gmail.com</a><br>Website: <a href="https://semcocanada.com">semcocanada.com</a></p>
  </main>
</body>
</html>`;

const policyBody = policy.match(/<body>([\s\S]*?)<\/body>/i)?.[1] ?? policy;

const plainTextPolicy = policyBody
  .replace(/<style>[\s\S]*?<\/style>/i, '')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<li>/gi, '- ')
  .replace(/<\/(h1|h2|p|li|header)>/gi, '\n\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n[ \t]+/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

Deno.serve(() => new Response(plainTextPolicy, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  }));
