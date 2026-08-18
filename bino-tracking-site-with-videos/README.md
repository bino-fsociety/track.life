# Bino Tracking App

A private, local-first personal progress dashboard. Bino Tracking App runs entirely in your browser and stores data in IndexedDB on your device. There is no account, backend, subscription, analytics service, or paid domain.

All financial tracking uses EUR (€) as the default and only currency.

## What is included

- Daily dashboard with money, training, work, sleep, mood, wins, and progress charts
- Money tracker with transactions, categories, balance math, and period totals
- Training tracker with gym status, reps, movement, records, and streaks
- Work tracker with daily hours, totals, charts, and a color heatmap
- Sleep and mood trackers with averages and trend charts
- Videos tracker for daily YouTube/content targets, videos made, shorts, ideas, streaks, and charts
- Multi-project business tracker
- Goals with live progress bars and completed history
- Searchable wins journal
- Immediate autosave to IndexedDB
- JSON export, import, and confirmed full reset
- Desktop sidebar and iPhone-friendly bottom navigation

## 1. Run on a MacBook

You need [Node.js](https://nodejs.org/) version 20.19 or newer (Node 22 LTS is recommended). After installing it, open Terminal, go to this project folder, and run:

```bash
npm install
npm run dev
```

Open the local address shown in Terminal, normally:

```text
http://localhost:5174
```

Keep the Terminal window open while using the app. Stop it with `Control + C`.

For a production-style local build:

```bash
npm run build
npm run preview
```

## 2. Open on an iPhone on the same Wi-Fi

1. Connect the MacBook and iPhone to the same Wi-Fi network.
2. On the MacBook, run `npm run dev`.
3. Terminal will show a **Network** address similar to `http://192.168.1.25:5174`.
4. Enter that Network address in Safari on the iPhone.
5. If macOS asks whether Node may accept incoming connections, choose **Allow**.
6. Optional: in Safari, tap **Share → Add to Home Screen** for an app-like shortcut.

No domain or hosting bill is needed. The MacBook must be awake and the development server must remain running while the iPhone uses the app.

Important: browser storage is device-specific. Data entered in Safari on the iPhone stays on the iPhone; data entered on the Mac stays on the Mac. To move data between them, export a backup on one device and import it on the other. This keeps the app private and avoids any cloud service.

If the Network address is not visible, find the Mac’s Wi-Fi IP with:

```bash
ipconfig getifaddr en0
```

Then open `http://YOUR_IP:5174` on the iPhone.

## 3. Back up data

1. Open **Data & Backup** in Bino Tracking App.
2. Select **Download backup**.
3. Keep the downloaded `.json` file somewhere safe.

The file contains all tracker entries, projects, goals, journal entries, and the starting balance. Back up regularly. Private browsing should not be used because browsers may remove private-session storage.

## 4. Restore data

1. Open **Data & Backup**.
2. Select **Choose backup**.
3. Pick a Bino Tracking App `.json` backup.

The imported file replaces the data currently stored in that browser. Export the current data first if it might be needed later.

## Data safety

IndexedDB persists when the browser closes, the Mac restarts, or the local app is stopped. Data can still be removed if browser website data is manually cleared, the browser profile is deleted, or macOS storage cleanup removes site data. The JSON export is the durable, portable backup.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start locally and expose to the same Wi-Fi network |
| `npm run build` | Make a production build |
| `npm run preview` | Preview the production build on the same Wi-Fi network |
| `npm run typecheck` | Check TypeScript without building |

## Deploy on Vercel

1. Extract the ZIP and open the extracted project folder.
2. Upload the **contents of that folder** to a GitHub repository. `package.json`, `src`, `index.html`, and `vite.config.ts` must be visible at the repository root—not inside another nested project folder.
3. Import that repository in Vercel and leave **Root Directory** as `./`.
4. Vercel will use `npm install`, run `npm run build`, and publish the `dist` folder automatically from `vercel.json`.

Expected Vercel settings:

- Framework Preset: **Vite**
- Root Directory: `./`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

No environment variables, database, paid service, or domain are required. Data remains local to each visitor's browser.
