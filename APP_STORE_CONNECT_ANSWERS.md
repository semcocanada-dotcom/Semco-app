# Semco Pro App Store Connect Answers

Prepared: 2026-08-12

## App Information

- Name: Semco Pro
- Subtitle: Built for Semco Installers
- Primary category: Business
- Secondary category: Productivity
- Content rights: The app contains third-party content, and Semco Canada must confirm that it has the necessary rights to use it.
- Age rating: 4+

## Pricing and Availability

- Price: Free
- Available territories: Canada and South Africa
- Release: Automatically release after App Review approval

## Version 1.0.2 — What’s New

The material calculator now distinguishes non-wet walls, wet areas, and submerged work so Liquid Membrane is optional only where the selected system permits it. SIP preparation guidance now recommends the appropriate cleaner sequence and estimates cleaner quantities, package sizes, and prices. Material requests route to Modern Arc for Ontario/eastern regions and Innovative Finishes for Manitoba/western regions using the same national price catalog.

## Privacy Policy

Privacy Policy URL:
https://hriocefqjedalnaebeiw.supabase.co/functions/v1/privacy-policy

Support URL:
https://www.semcocanada.ca/contact

No data is used for tracking. No data is used for third-party advertising or developer advertising. Semco Pro does not sell personal information.

### Data Collected and Linked to the Installer Account

All of the following are used for App Functionality:

- Contact Info: Name
- Contact Info: Email Address
- Contact Info: Phone Number
- Contact Info: Physical Address
- Contact Info: Other User Contact Info, including company or business name
- Financial Info: Payment Info, only when a user-uploaded purchase receipt image contains merchant-printed payment-method details such as card type or masked digits
- Purchases: Purchase History, including submitted receipts and material request records
- User Content: Photos or Videos, including project stages, receipts, and colour samples
- User Content: Other User Content, including project details, customer sign-off forms, signatures, and job notes
- Identifiers: User ID

Semco Guide questions, searches, and saved guide conversations stay on the device and are not collected by Semco Canada.

### Technical Data Linked to the Device Installation

Expo Application Services processes the following only to check for and deliver app updates and to measure update reliability. Declare these as linked because the randomized persistent installation token can associate the technical events with the device installation, even though Semco Pro does not attach the installer's Supabase account UUID:

- Identifiers: Device ID (a randomized Expo installation token), used for App Functionality and Analytics
- Usage Data: Product Interaction (app/update checks and downloads), used for App Functionality and Analytics
- Diagnostics: Crash Data, used for App Functionality and Analytics
- Diagnostics: Other Diagnostic Data (update IDs, failed-update IDs, OS and limited error/performance information), used for App Functionality and Analytics

### Tracking

- Data used for tracking: No
- Third-party advertising: No
- Advertising or marketing: No

## Reviewer Notes

Semco Pro is a field operations app for professional Semco installers. A standard installer review account is provided below. The reviewer can create a test project, enter project and customer information, capture or select stage photos, calculate Semco material quantities, browse colour references and technical documents, use Semco Guide, submit a purchase receipt, complete sign-off forms, and permanently delete the account and its associated app data from More > Account and Security.

Material requests are internal dealer-review requests. The app does not process payments and does not automatically place external material orders. Colour images are references only; installers must verify final selections with an approved physical sample.

Semco Guide is an entirely local reference tool. It uses deterministic calculators, coded field rules, and Semco technical text installed with the app. It does not call a remote model or remote semantic-search service, and its questions and saved conversations are not synced. Material quantities always come from the app's deterministic calculator formulas.

This build contains only installer-facing mobile routes. It does not include an administrator or dealer portal, and it does not include a rewards program.

### Guideline 3.2 — Business Model

Semco Pro is for independent professional installer and contractor businesses that use Semco products; it is not restricted to the employees of one company. Any installer business can create an account in the app using its company/contact details and email/password. A Semco Account ID is optional. Certification and dealer assignment support warranty and dealer workflows but are not required to sign in.

There is no subscription, paid digital content, paywall, in-app purchase, or fee for app access. Material quantities and pricing are estimates only. A material request is sent to a dealer for review and does not place an order or collect payment. Any purchase of physical materials or services is arranged and paid for outside the app.

### Suggested Review Path

1. Sign in with the dedicated installer review account below.
2. Open the fictional sample project named **Apple Review Sample — No Real Customer**.
3. Create a separate test project to exercise customer-data consent, calculations, photos, sign-off forms, and material requests. All customer information used for review should be fictional.
4. Open **Semco Guide** to test the installed, on-device reference answers and deterministic calculators. No question or conversation is sent to an AI or remote search service.
5. Open **More > Account and Security** to inspect the permanent in-app account-deletion flow. Do not delete the dedicated reviewer account; use a disposable account if deletion must be completed end to end.

## Screenshot and Metadata Replacement Required Before Submission

- Replace every prior dashboard screenshot: the current build removes the nonfunctional microphone icon and all reward-progress UI.
- Replace every prior assistant screenshot and any metadata that says "Ask Semco AI" or implies generated answers. Use the name "Semco Guide" and show the installed-reference wording from this build.
- Remove screenshots or promotional text showing reward tiers, prizes, unlocked rewards, administrator tools, or a dealer portal.

## Reviewer Contact

- First name: Dieter
- Last name: Kitzul
- Email: info@semcocanada.ca
- Phone: +1 306-530-7910

## Reviewer Account

A dedicated least-privilege installer reviewer account exists and was authenticated successfully against the production backend on 7 August 2026. It does not have administrator or dealer-portal access.

- Username: apple-review@semcocanada.ca
- Password: enter the verified reviewer password directly in App Store Connect; do not store it in this repository

## Release Blockers Before Submission

- Verify the privacy-policy URL above in mobile Safari immediately before submission; it must remain readable and must not return an error or raw HTML source.
- Replace all stale screenshots listed above with captures from the final production build and fictional data.
- Complete clean-install iPhone and iPad tests for sign-in, project sync, photo selection/camera denial, sign-off PDF upload, material request, and account deletion with a disposable account.
- Confirm the Apple Developer seller/legal entity is authorized to publish the official Semco Canada app and retain written permission for the SEMCO name, trademarks, manuals, and other supplied content.
