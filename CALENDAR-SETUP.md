# Connecting Google Calendar (read-only)

One-time setup, about 10 minutes. All of it happens in the Google Cloud console
for the project you already created for Firebase ("VC Life Success").

When you're done, send me the Client ID and I'll bake it into `index.html` for you —
or paste it in yourself where it says `window.__GOOGLE_CLIENT_ID__ = ""`.

---

## 1. Turn on the Calendar API

1. Go to **console.cloud.google.com**
2. Top-left project picker → choose **VC Life Success**
3. Search bar at the top → type **Google Calendar API** → open it
4. Click **Enable**

---

## 2. Set up the consent screen

This is the screen Google shows you when you tap Connect.

1. Left menu → **APIs & Services** → **OAuth consent screen**
2. User type: **External** → Create
3. Fill in the required fields:
   - App name: `SUCCESS`
   - User support email: your email
   - Developer contact email: your email
4. Save and continue
5. **Scopes** step → Save and continue (you don't need to add any here)
6. **Test users** step → **Add users** → add your own Google account email
   → Save and continue

Leave it in "Testing" mode. That's fine for personal use — it just means only
the accounts you list as test users can connect, which is exactly what you want.

---

## 3. Create the Client ID

1. Left menu → **APIs & Services** → **Credentials**
2. **Create credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: anything, e.g. `SUCCESS web`
5. Under **Authorized JavaScript origins**, click **Add URI** and enter exactly:

   ```
   https://riseupselects.github.io
   ```

   Domain only — no `/grind-log`, no trailing slash.

6. Leave "Authorized redirect URIs" empty.
7. **Create**

Google shows you a **Client ID** that looks like:

```
309652069552-abc123def456.apps.googleusercontent.com
```

That's the value you need.

---

## 4. Put it in the app

Open `index.html` and find this line near the bottom:

```html
window.__GOOGLE_CLIENT_ID__ = "";
```

Paste your Client ID between the quotes, save, and upload to GitHub.

(Or just send me the Client ID and I'll return a ready-to-upload zip.)

---

## Using it

Open the **Schedule** tab. You'll see a "Google Calendar — CONNECT" card.
Tap Connect, approve on Google's screen, and your events appear.

- **Day view** shows meetings above your routine blocks
- **Week view** shows the next 7 days of meetings at a glance
- It reconnects silently on later visits, so you approve once

You may see a warning during approval that the app isn't verified. That's expected
for an app in Testing mode used by its own developer — click **Advanced** →
**Go to SUCCESS (unsafe)** to continue. It only appears because you haven't
submitted the app for Google's public review, which you don't need to do for
personal use.

---

## What it can and can't do

- **Read only.** It can see your events. It cannot create, edit, or delete anything.
- **Nothing is stored.** Events are fetched live each time and never written to
  your database.
- **Primary calendar only.** If you keep meetings on a separate calendar and want
  those too, tell me and I'll add calendar selection.
