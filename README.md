# Work Bucket List App

A React + Vite app for tracking work bucket-list items and copying a clean Outlook status report. **Installable and works offline** (PWA).

## Features

- Add / edit work items inline (title, category, priority, status, target date, notes)
- Status tracking: Not Started, In Progress, Done — with auto completion %
- **Overdue / Due-soon badges** driven by the target date
- **Filter** by status and priority (with live counts) + free-text search
- **Sort** by priority, target date, status, recently added, or manual order
- **Drag-and-drop reorder** (plus up/down buttons for touch/keyboard) in manual mode
- **Dark mode** (remembers your choice, follows system on first run)
- **Delete with Undo** (5-second toast) — no accidental data loss
- Copy a clean **Outlook-friendly HTML table** (sender name is editable)
- **Export JSON** (backup) and **Export CSV** (Excel), **Import JSON** (restore)
- Auto-saves to browser localStorage, with a warning if saving fails
- **Offline support** via service worker (precaches the app shell)

## Local run

```bash
# Install dependencies (uses the committed lockfile)
npm ci
```

```bash
# Start the dev server at http://localhost:5173
npm run dev
```

```bash
# Production build into dist/
npm run build
```

```bash
# Preview the production build locally
npm run preview
```

> Node 20+ recommended (CI uses Node 22 LTS; see .nvmrc).

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. Repository Settings -> Pages -> Build and deployment -> Source: GitHub Actions.
3. Push to main or master. The workflow builds and deploys automatically.

The workflow auto-detects the correct base path:
- Project site (github.com/you/my-repo) -> served at /my-repo/, base set automatically.
- User/Org site (you.github.io) -> served at /, base set automatically.

No manual vite.config.js edits needed. For non-Pages hosts, build with a custom base:

```bash
# Override the base path for any other static host
VITE_BASE=/custom/path/ npm run build
```

## Using it offline / installing

- Open the deployed URL once while online — the service worker caches the app.
- After that it loads with no network. In Chrome/Edge use the Install icon in the
  address bar (or the menu -> Install) to add it as a desktop/mobile app.
- New versions install silently and apply on the next load (registerType: autoUpdate).

> Opening the built files directly via file:// will NOT enable the service worker —
> browsers only run service workers over http/https (localhost counts).
> Use `npm run dev`, `npm run preview`, or the hosted Pages URL.

## Data & backups

- All data lives in this browser's localStorage, tied to THIS browser + THIS URL.
  A different browser, or clearing site data, starts fresh.
- Use Export JSON regularly for a portable backup; Import JSON to restore or move
  between machines.
- Data from the previous app version (work-bucket-list-v1) is migrated automatically
  on first load.

## Important

Do NOT enter passwords, API keys, tokens, or client-confidential data — this is a
local, unencrypted browser store.

## Project structure

```
src/
  lib.js              # constants, storage+migration, dates, sorting, CSV, Outlook report
  useBucketList.js    # state hook: items, persistence, derived summary, all actions
  App.jsx             # tabs, filtering/sorting, delete-with-undo, composition
  components/
    Header.jsx        # title, progress, overdue banner, dark-mode toggle
    SummaryCards.jsx  # stat cards
    AddForm.jsx       # add item (Enter to add, Esc to clear)
    Toolbar.jsx       # search + status/priority filters + sort
    BucketTable.jsx   # editable table, due badges, drag/arrow reorder
    OutlookPanel.jsx  # report copy, editable name, JSON/CSV export, import, preview
    Toast.jsx         # undo toast
    ui.jsx            # shared classes + small primitives
```
