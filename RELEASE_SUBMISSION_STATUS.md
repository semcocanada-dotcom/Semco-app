# Semco Pro Release Submission Status

Last updated: 2026-07-16

## Release Goal

Publish Semco Pro for installers on the Apple App Store and Google Play.

## Application

- App name: Semco Pro
- Version: 1.0.17
- iOS bundle identifier: com.semcocanada.semcopro
- Android package: com.semcocanada.semcopro
- Expo project: @kitzul88/semco-pro
- Expo project ID: cc9001d8-b1f9-44b2-b59c-c7b35d8c6129

## Verification Completed

- TypeScript: passed (`npx tsc --noEmit`)
- ESLint: passed (`npm run lint`)
- Jest: 4 suites and 9 tests passed
- Expo Doctor: 18/18 checks passed
- Web production export: passed
- Android production bundle export: passed
- Cloud project-photo upload and signed download: verified
- Cloud purchase-receipt upload and signed download: verified
- Cloud signed-form PDF upload and signed download: verified
- Account creation, password reset, privacy policy, and in-app deletion request flows are present

Receipt images are stored securely, but receipt quantities are currently entered and verified manually. Automatic receipt OCR is not part of version 1.0.

## Apple App Store

- Apple app ID: 6790031528
- iOS build: 22
- EAS build ID: 484b4973-5f24-44aa-8f90-22860831926d
- EAS submission ID: 63c6acd4-1a19-4e82-bbed-8d8a457e28a6
- Binary upload: complete
- Build processing: complete
- Screenshots: complete for iPhone 6.5-inch and iPad 13-inch
- Description, keywords, support URL, marketing URL, and promotional text: complete
- Calculated age rating: 4+
- Release setting: automatically release after approval

### Apple Items Still Requiring Owner Confirmation

- Save the 4+ age-rating declaration
- Declare that Semco Canada has rights to all third-party content included in the app
- Publish the app privacy questionnaire and privacy-policy URL
- Select Business as primary category and Productivity as secondary category
- Save subtitle: Built for Semco Installers
- Select free pricing and App Store territory
- Create a least-privilege Apple reviewer account and provide its credentials to Apple
- Add reviewer contact name, phone, email, and review notes
- Add the version for review, then submit it to Apple App Review

Privacy policy URL:
https://hriocefqjedalnaebeiw.supabase.co/functions/v1/privacy-policy

Recommended initial availability: Canada only, free. Expand to additional countries later when Semco Canada approves dealer coverage and support.

## Google Play

- Android production configuration: ready
- Android version code: 20
- Local Android production bundle export: passed
- Current production AAB: not built yet
- Google Play developer organization account: not created yet
- Current browser Google account is not the Semco Canada account

### Android Items Still Requiring Owner Confirmation

- Approve one EAS Android production build credit
- Create the Google Play organization account under semcocanada@gmail.com
- Complete Google's organization verification and one-time developer registration payment
- Create the Semco Pro Play listing
- Complete Play data-safety, content-rating, app-access, and target-audience declarations
- Upload the production AAB and submit the release for Google review

## Release Notes for Reviewers

Semco Pro is a field operations app for professional Semco installers. Reviewers can create a test project, add project and customer information, capture or select stage photos, calculate Semco material quantities, browse colour references and official technical documents, use the grounded Ask Semco assistant, complete project sign-off forms, and request account deletion from Account and Security.

Material requests are internal dealer-review requests. The app does not process payments or automatically place external orders. Colour images are references and final selections must be verified with an approved physical sample.
