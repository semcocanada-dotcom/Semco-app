# Getting the App onto a Tester's iPhone

Two ways to put Semco Pro on someone's iPhone for testing. Path A uses the
repo's existing build automation and is the fastest for one or two people.
Path B (TestFlight) is Apple's official beta channel and scales better.

Both consume one EAS build credit per build. Nothing in this repo triggers a
build automatically except a change to the `BUILD_TRIGGER` file.

## Path A - Internal preview build (fastest for a manager test)

The GitHub Action `.github/workflows/eas-build.yml` runs
`eas build --platform ios --profile preview` whenever `BUILD_TRIGGER`
changes on `semco-pro-preview` (requires the `EXPO_TOKEN` repo secret).
Internal iOS builds install straight from a link, but every iPhone must be
registered **before** the build.

1. **Register the tester's iPhone** (one-time, from your PC):
   ```powershell
   eas device:create
   ```
   Choose "Website" - it produces a registration link/QR. Send it to the
   tester; they open it on their iPhone in Safari and install the profile.
   Confirm with `eas device:list`.
2. **Trigger the build** (after merging the changes you want included):
   ```powershell
   git checkout semco-pro-preview
   git pull
   # bump the trigger file with the current timestamp
   Set-Content BUILD_TRIGGER (Get-Date -Format o)
   git commit -am "Trigger preview build"
   git push
   ```
   Or run locally instead of CI: `eas build --platform ios --profile preview`
3. **Share the install link**: when the build finishes (expo.dev dashboard,
   Builds tab), open the build page and share its install URL/QR with the
   tester. They open it in Safari and tap Install.
4. **Updates after that are free**: every push to `semco-pro-preview`
   publishes an OTA JS update to the `preview` channel
   (`.github/workflows/eas-update.yml`). The installed app picks it up on
   next launch - no new build needed unless native config changes.

## Path B - TestFlight (Apple's beta program)

Better for more testers or pre-release staging. Needs the Apple Developer
account signed in for `eas submit`.

1. Build and submit from your PC:
   ```powershell
   eas build --platform ios --profile production
   eas submit --platform ios --latest
   ```
2. Wait for Apple processing (~15-45 min), then in
   [App Store Connect](https://appstoreconnect.apple.com) -> Semco Pro ->
   TestFlight, add the tester's email to an Internal Testing group (team
   members) or an External Testing group (anyone; first external build gets a
   short Beta App Review).
3. The tester installs the free **TestFlight** app, accepts the email
   invite, and installs Semco Pro.
4. Production builds are on the `production` update channel, so later
   JS-only fixes ship free with `eas update --channel production`.

## Which one?

- One manager testing this week -> **Path A**.
- Ongoing beta group, or prep for the App Store -> **Path B**.

## Reminders

- iOS build numbers auto-increment on the production profile; the preview
  profile uses the number in `app.json`.
- Before a public App Store release (not needed for TestFlight): host the
  privacy policy publicly and set it in App Store Connect, and rename the
  "Preview" BUILD_LABEL in `src/constants/build.ts`.
