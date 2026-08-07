import '@supabase/functions-js/edge-runtime.d.ts';

const policy = `SEMCO PRO PRIVACY POLICY

Last updated: August 7, 2026

Semco Canada operates the Semco Pro mobile application for professional installers. This policy explains what information the app collects, why it is used, how it is protected, and the choices available to installers and customers.

INFORMATION WE COLLECT

Semco Pro may collect installer account and company information, including name, business name, email address, phone number, business address, and postal code.

Project records may include a customer's name, email address, phone number, site address, surface details, colours, products, material estimates, job notes, and project status. The app may also collect custom colour formulas and notes, colour-sample photos, stage photos, purchase receipts, signed project forms, customer signatures, warranty submissions, and material requests when an installer chooses to create or submit those records. A receipt image may show payment-method information printed by the merchant, such as a card type or masked digits. Project and sign-off records also store the version, full text, and acceptance time of the applicable privacy or authorization notice.

Basic technical and security information may be processed when needed to authenticate an account, deliver app updates, operate cloud services, and investigate errors or misuse.

HOW WE USE INFORMATION

We use submitted information to provide project tracking, field documentation, material estimates, dealer material-request review, warranty review, signed customer records, receipt review, account support, and security.

CUSTOMER PROJECT DATA AUTHORIZATION

Before customer fields are shown for a new project, the installer must confirm that the customer gave permission, or that the installer has other legal authority, to store the customer name, email, phone number, site address, notes, and related project records on the device and in Supabase-hosted cloud storage. The notice explains access, purposes, retention, account deletion, and privacy contacts. Cancel returns without saving. The notice version, full text, and acceptance time are stored with the project.

CUSTOMER SIGN-OFF ACKNOWLEDGEMENT

Before Semco Pro displays customer sign-off fields or the signature pad, the app tells the customer that their name, optional email, signature, completed PDF, and related project details will be stored in Supabase-hosted cloud storage. The notice explains access by authorized Semco Canada staff and the installer's assigned dealer, the project, material-request, warranty, support, and recordkeeping purposes, retention, account deletion, and privacy contacts. The customer must select I Agree & Continue. Cancel does not capture or upload new sign-off details.

The notice version, full text, and acceptance time are stored with the sign-off record and included on a privacy-audit page in a signed PDF. A customer email is stored with the project and is not emailed automatically.

SEMCO GUIDE

Semco Guide is a local reference tool. It uses deterministic calculators, coded field rules, and Semco technical text installed with the app. Guide questions, recent conversation context, searches, and answers are processed and stored on the installer's device. Semco Guide does not send this content to an external model or semantic-search service.

STORAGE AND SERVICE PROVIDERS

Semco Pro uses Supabase for account authentication, database records, and access-controlled file storage. It uses Expo Application Services to check for and deliver app updates. Expo may process the device operating system, a randomized installation token used to determine whether an update was downloaded, update interactions, and limited error, performance, or failed-update information. Semco Pro does not link that Expo token or technical information to the installer's Supabase account. This information is used only for update delivery, app functionality, analytics, and diagnostics, not advertising or tracking. Semco Guide conversations are not synced to Supabase. Semco Canada does not sell personal information and does not use personal information for third-party advertising or tracking.

WHO CAN ACCESS RECORDS

Installers can access their own account and project records. Authorized Semco Canada staff can review submitted installer, project, sign-off, warranty, receipt, and material-request records. An assigned dealer may access project records, photos, sign-offs, and material-request information for installers assigned to that dealer for project documentation, review, pricing, material-request support, and warranty support. Customer signatures and sign-off forms are used only for the project record to which they belong.

RETENTION AND ACCOUNT DELETION

Active account and project records are retained while needed to provide the app and administer warranties and material requests. When an installer confirms Delete Account in More > Account and Security, Semco Pro immediately and permanently deletes the authentication account, associated cloud records, private files, and data stored by the app on that device. This action cannot be undone.

SECURITY

Semco uses authenticated accounts, row-level database controls, private storage, time-limited file links, and restricted staff access. No online service can guarantee absolute security, so installers should protect their passwords and report suspected unauthorized access.

YOUR CHOICES

Installers can edit their company profile, reset their password, and permanently delete their account in the app. Requests to access or correct personal information may also be sent to Semco Canada.

CHILDREN

Semco Pro is a professional trade application and is not directed to children under 13.

CHANGES TO THIS POLICY

We may update this policy as the app or applicable requirements change. The current version and update date will remain available at this URL.

CONTACT

Semco Canada
Email: info@semcocanada.ca
Phone: +1 (306) 530-7910
Support: https://www.semcocanada.ca/contact
`;

Deno.serve(() => new Response(policy, {
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  },
}));
