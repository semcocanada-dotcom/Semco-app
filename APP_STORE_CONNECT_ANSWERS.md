# Autism Fund Tracker App Store Connect Answers

Prepared: 2026-08-07

## App Information

- Name: Autism Fund Tracker
- Version: 1.0
- Selected replacement binary: build 14
- Legal operator: Innovative Finishes Inc.
- Primary category: Finance
- Secondary category: Health & Fitness
- Price: Free
- Recommended initial territory: Canada
- Release: Automatically release after App Review approval

## Public URLs

- Privacy Policy: https://semcocanada-dotcom.github.io/Semco-app/
- Support: https://semcocanada-dotcom.github.io/Semco-app/support.html

Both pages must be published and verified in mobile Safari before submission.

## Reviewer Contact

- First name: Dieter
- Last name: Kitzul
- Email: info@semcocanada.ca
- Phone: +1 306-530-7910

## Reviewer Account

The dedicated production review account was authenticated successfully on 7 August 2026 and was used to verify authenticated receipt recognition for both a JPEG and a one-page PDF.

- Username: appreview@semco.ca
- Password: enter the verified temporary reviewer password directly in App Store Connect; do not store it in this repository
- Two-factor authentication: not required

Do not delete this account. Apple can inspect the deletion screen with it, but a disposable account must be used if deletion is completed end to end.

## Reviewer Notes

Autism Fund Tracker is operated by Innovative Finishes Inc. and is an independent family recordkeeping tool for Saskatchewan Autism Spectrum Disorder Individualized Funding (ASD-IF). It is not affiliated with, endorsed by, or operated by the Government of Saskatchewan, and it does not decide eligibility, approve expenses, or submit claims to government.

The app lets an authorized adult record a child's approved funding amount, expenses, manually entered mileage, respite records, appointments, private provider records, and receipt attachments. Funding amounts shown during setup are editable estimates based on public program information; the account holder must enter the child's actual approved amount.

Expense labels are neutral private-recordkeeping terms: **Recorded** and **Excluded**. They are not government approval, review, pending, or submission states. Mileage amounts are explicitly identified as user-recorded estimates and do not guarantee eligibility or payment.

The app does not request or use device location. It does not provide a copied public provider directory or automatically calculate distance. The Providers screen contains private, user-created entries and a link that opens the official Saskatchewan registry in the system browser.

Receipt text recognition is optional. After the user selects a camera image, photo, or document, the app identifies Google Cloud Vision and offers **Attach without recognition** or **Use text recognition**. Declining recognition keeps the attachment and allows manual entry. A failed recognition attempt also keeps the attachment and requires a new affirmative choice before any retry.

Calendar export and notification reminders are off by default and are requested only after the user enables the corresponding option. Saving an appointment works when either permission is declined. Lock-screen reminder text is generic.

The app provides one-tap links to the untouched official Saskatchewan mileage and respite PDF forms hosted on publications.saskatchewan.ca and to the official online expense portal. Those government resources open externally and are not embedded, altered, or reproduced by the app. PDFs generated inside Autism Fund Tracker are unbranded recordkeeping worksheets marked **Unofficial — not a Government of Saskatchewan form**; the app does not automatically submit them.

Permanent account deletion is available in **Profile > Delete Account**. The user must type `DELETE` and confirm. The authenticated deletion service removes private receipt files, the authentication account, and associated app data. A disposable test account was deleted successfully in production.

### Required physical-device evidence for the August 7 rejection

Apple explicitly requires a physical-device screen recording that shows: (1) creating an account or signing in, (2) navigating to **Profile > Delete Account**, and (3) the complete deletion flow through final confirmation. Attach that recording under **App Review Information > Attachment** and reference it in **Notes** before resubmitting. Use a disposable account; never delete the dedicated review account.

## Response to Guideline 5.1.1(iv) — Location Permission

The location issue is resolved in this binary. The automatic custom location message and location permission request were removed. The app no longer includes a location purpose string, location permission, location SDK, current-position request, address autocomplete, geocoding, routing, nearby-provider sorting, or automatic distance calculation. Mileage is entered manually. No screen can request location access.

## Response to Guideline 2.1 — Demo Access and Completeness

The production reviewer credentials above have been verified. The account uses ordinary email/password authentication without two-factor authentication. Authenticated JPEG and PDF receipt-recognition requests were also verified successfully against the production service.

Suggested review path:

1. Sign in with the dedicated review account.
2. Open Profile and create or select a fictional child record; the child-data authority notice must be accepted before first save.
3. Enter a funding year using a fictional approved amount.
4. Attach a sample receipt and test either manual entry or optional text recognition.
5. Record a manual mileage trip, a respite worker/session, and an appointment with calendar/reminders left off.
6. Add a fictional private provider, then use the separate official-registry link to verify it opens the Saskatchewan website.
7. Export an unbranded worksheet and open the external official form/portal links.
8. Inspect **Profile > Delete Account**. Use a disposable account—not the dedicated review account—if completing deletion.

## App Privacy Labels

No data is used for tracking, third-party advertising, or developer advertising.

Data linked to the account and used only for App Functionality:

- Contact Info: account-holder name and email address
- Contact Info: Phone Number, when the account holder records an optional respite-worker or provider phone number
- Contact Info: Physical Address, when the account holder adds a private provider's street address, city, or postal code
- Health: child diagnosis date/notes and funding or care records
- Sensitive Info: optional Saskatchewan Health Services Number and other child/care details
- Financial Info — Payment Info: only when a user-uploaded receipt image contains merchant-printed payment-method details such as card type or masked digits
- Financial Info — Other Financial Info: approved funding amounts, expense/reimbursement amounts, and amounts recorded as paid
- Purchases — Purchase History: purchase receipt details recorded for funding expenses
- User Content — Photos or Videos: receipt images selected or captured by the account holder
- User Content — Other User Content: receipt PDFs, notes, private provider details, respite-worker details, and appointment details
- Identifiers: User ID

Technical data associated with the persistent device installation and used only for App Functionality and Analytics:

- Identifiers: Device ID (a randomized Expo installation token)
- Usage Data: Product Interaction (app/update checks and downloads)
- Diagnostics: Crash Data
- Diagnostics: Other Diagnostic Data (update IDs, failed-update IDs, operating-system and limited error information)

Do not declare Precise Location, Coarse Location, advertising data, or tracking. The current app does not collect the family's home address or device location, but its optional private-provider address fields still require the linked Physical Address declaration above.

## Screenshot and Metadata Replacement Required

- Remove every screenshot or description showing device location, nearby-provider sorting, automatic distance calculation, a copied/approved provider directory, or direct government claim submission.
- Do not describe the generated worksheets as official government forms or form prefill.
- Show manual mileage, private providers plus the external official-registry link, optional receipt recognition, and the in-app account-deletion screen using fictional data.
- State clearly that official Saskatchewan forms and the expense portal open externally from government-hosted links.

## Release Blockers Before Submission

- Innovative Finishes Inc. is the confirmed legal operator. The current Apple Developer membership is still enrolled as an Individual; complete the Individual-to-Organization conversion to Innovative Finishes Inc. before review submission, as required by App Review Guideline 5.1.1(ix) for an app that stores a child's health and sensitive information.
- Publish and verify both public URLs above; the support page must not return 404 and the privacy policy must match this binary.
- Complete clean-install physical iPhone and iPad tests for login, child/funding creation, JPEG/PDF receipt recognition, permission denial, worksheet export, and account deletion with a disposable account. The August 7 rejection requires the complete deletion test to be recorded on a physical device and attached to App Review Information before resubmission.
- If official Saskatchewan PDF artwork is ever embedded, reproduced, or automatically filled inside the app again, obtain written Crown copyright and government-logo permission first. Public download availability alone does not grant commercial republication rights.
