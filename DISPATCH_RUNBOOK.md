# Dispatch Runbook — Get the app update onto the phone

**Goal:** Ship the latest JavaScript (Respite tab + 6-tab layout + auto-update) to the
installed app, and restore the CI pipeline so future pushes deploy automatically.

**Why it's stuck:** Builds and over-the-air (OTA) updates run on **Expo's servers (EAS)**,
authorized by a secret token (`EXPO_TOKEN`) stored in GitHub. That token has stopped working
(no build or update has landed in ~12 days; the PR shows 0 passing checks). Nobody can read a
GitHub secret back, so it has to be regenerated. The code itself is already pushed and correct.

Key facts you'll need:
- Expo account / owner: **Kitzul88**
- Expo project slug: **semco-app**  (project ID `6300fb3b-12f9-4b5c-9d1d-66dba1f328ee`)
- Release channel / EAS Update branch: **preview**
- GitHub repo: **semcocanada-dotcom/Semco-app**
- Code branch to deploy from: **claude/autism-grant-app-eUE6R**
- Installed app version/runtime: **1.0.0** (the OTA below is compatible with it — verified)

---

## PATH A — Fastest: push the OTA update by hand (~2 minutes, no build credits)

Do this on a computer with Node.js installed and signed into the Kitzul88 Expo account.

```bash
# 1. Get the latest code
git clone https://github.com/semcocanada-dotcom/Semco-app.git
cd Semco-app
git checkout claude/autism-grant-app-eUE6R
git pull origin claude/autism-grant-app-eUE6R

# 2. Install dependencies
npm ci

# 3. Log in to Expo as Kitzul88
npx eas-cli login          # enter Kitzul88 username + password

# 4. Publish the over-the-air update to the "preview" channel
npx eas-cli update --branch preview --message "Respite tab + 6-tab fix"
```

Then on the phone:
1. Open the app once (it downloads the update silently).
2. **Force-close it** (swipe it away) and **reopen** → the **Respite** tab now shows (6 tabs:
   Home · Expenses · Mileage · Respite · Calendar · Providers).

That's it — the fix is live. (The one-time force-close is only needed this round; the new code
includes auto-apply, so future updates apply on their own when the app is reopened.)

---

## PATH B — Permanent: fix the CI token so every push auto-deploys

1. **Generate a new Expo token**
   - Go to https://expo.dev and log in as **Kitzul88**
   - Account Settings → **Access Tokens** → **Create token**
   - Copy the token value (you only see it once)

2. **Update the GitHub secret**
   - Go to https://github.com/semcocanada-dotcom/Semco-app
   - **Settings → Secrets and variables → Actions**
   - Find **`EXPO_TOKEN`** → **Update** → paste the new token → save
     (If it doesn't exist, click **New repository secret**, name it exactly `EXPO_TOKEN`.)

3. **Tell the developer (Claude session) it's done** — a fresh push will then re-run CI and
   deploy automatically. Or trigger it yourself by editing the `BUILD_TRIGGER` file (add a new
   dated line) and committing — that fires a native build; any other push fires an OTA update.

---

## If a NATIVE build (not just OTA) is also needed and still fails after the token fix

A native build is only required when native code/modules change — the current fix does **not**
need one. But if you do want a fresh installable build and it fails after the token is valid,
the next most likely cause is **EAS build credits exhausted**:
- Check https://expo.dev → Kitzul88 → **Billing / Usage**
- Free tier has a limited number of builds per month; wait for reset or upgrade the plan.
- OTA updates (Path A) do **not** consume build credits, so they keep working regardless.

---

## How to confirm it worked
- **expo.dev → project semco-app → Deployments/Updates**: a new update titled
  "Respite tab + 6-tab fix" appears under the **preview** branch.
- **On the phone:** after reopening, the bottom tab bar shows **6 tabs including Respite**, and
  the Respite screen shows a "Support Workers" card with an "Add your first worker" button.
