# Semco Pro — Google Play submission

## Release identity

- App name: `Semco Pro`
- App type: App
- Category: Business
- Default language: English (Canada)
- Package: `com.semcocanada.semcopro`
- Release: `1.0.2` (`versionCode 23` expected from the next production build)
- Price: Free
- Developer organization: Innovative Finishes Inc.
- Public developer name: SEMCO Canada
- Support email: info@semcocanada.ca
- Support URL: https://www.semcocanada.ca/contact
- Privacy policy: https://hriocefqjedalnaebeiw.supabase.co/functions/v1/privacy-policy
- Account deletion: https://hriocefqjedalnaebeiw.supabase.co/functions/v1/delete-account-request

## Store listing

### Short description

Field tools, project records and material estimates for Semco installers.

### Full description

Semco Pro is a free field companion for independent professional installers and contractors who use Semco products.

Organize fictional or customer-authorized project records, calculate deterministic material estimates, document project stages, and keep technical references available in one place.

Key features:

- Create and organize installer projects
- Calculate coverage and estimated material quantities
- Select non-wet wall, wet-area or submerged installation scope for the appropriate Liquid Membrane requirement
- Estimate SIP preparation cleaners, package quantities and prices
- Route material requests to the appropriate eastern or western Canadian supplier at the same national prices
- Record colours, products, batches and project progress
- Capture project photos and colour samples
- Prepare customer-authorized project forms and sign-offs
- Submit material requests for dealer review
- Access Semco technical documents and installation guidance
- Use Semco Guide for on-device deterministic reference answers
- Permanently delete your account and associated app data

Semco Guide processes its questions and saved conversations on the device. Semco Pro has no subscription, paid digital content, advertising or in-app purchases. Material requests do not place an order or collect payment; physical material purchases are arranged separately outside the app.

## App access for review

Semco Pro requires sign-in. Enter the durable installer review account in Play Console under **App content > App access**. It must not require two-factor authentication and must provide access to every feature in the Android binary.

Suggested reviewer path:

1. Sign in and open `Maple Street Sample Project`.
2. Create a separate project using fictional information and accept the customer-data authorization notice.
3. Run the coverage calculator with a fictional area.
4. Add a test photo using the Android system picker, or choose Camera and grant Camera access.
5. Open Forms and review the customer-facing consent before signing.
6. Open Semco Guide and review the on-device reference functionality.
7. Open More > Account and Security to inspect permanent account deletion. Do not delete the dedicated review account; create a disposable account for an end-to-end deletion test.

## App content declarations

- Ads: No
- In-app purchases/subscriptions: No
- Target audience: Adults / professional tradespeople; not designed for children
- News app: No
- Government app: No
- Financial features: No payments, credit, lending, wallets, trading or money transfer
- Health features: No
- Location: Not collected and no location permission requested
- Camera: Optional, used only after the user chooses to capture a project photo or colour sample
- Broad photo/storage access: Not requested; Android system picker is used

## Data safety working answers

Semco Pro uses encrypted transport. Data is linked to the installer account and is collected for app functionality, account management, security, support and developer communications as applicable. It is not sold, used for ads or used for cross-app tracking.

Declare the following conservatively:

- Personal info: name, email address, phone number, physical address, user IDs and business/company information
- Financial info / purchase history: receipt contents and physical-material purchase records when voluntarily submitted
- Photos and videos: project photos, colour samples and receipt images
- Files and documents: project PDFs and signed forms
- App activity: app interactions needed to provide and troubleshoot functionality
- App info and performance: crash logs and diagnostics processed by app/update infrastructure
- Other user-generated content: project notes, measurements, colours, material requests and signatures

Some project records may be accessible to authorized Semco Canada staff and the installer’s assigned dealer for project documentation, review, pricing, material-request support and warranty support. Disclose this as sharing unless Google’s form confirms that the applicable service-provider exception covers the exact relationship.

Users can request deletion both in the app and through the public deletion page. Account deletion removes the authentication account, associated records and private files, subject only to disclosed legal/security retention obligations.

## Version 1.0.2 release notes

- Liquid Membrane is now optional for walls in non-wet areas and remains required for wet walls, showers, pools and system details that require it.
- Added SIP Type A–E cleaner recommendations, quantity estimates, package sizes and prices.
- Added regional material-request routing to Modern Arc in Ontario/eastern regions and Innovative Finishes in Manitoba/western regions, with the same national prices.

## Required artwork

- App icon: `google-play-assets/play-icon-512.png` — 512×512 RGBA PNG
- Feature graphic: `google-play-assets/feature-graphic-1024x500.png` — 1024×500 RGB PNG
- Screenshots: capture at least two Android-phone screenshots from the final signed build using fictional data. Do not reuse screenshots with Apple status bars, `App Review Tester`, rewards, remote AI, microphone or removed admin/portal features.
