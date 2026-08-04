# SR6e Character Generator

A web app for building Shadowrun 6th Edition characters, supporting both the
core rulebook's **Priority System** and the SR6 Companion's **Life Path**
(Life Modules) system. Built for a small group of friends to log in and keep
their characters saved between sessions.

## Stack

- `server/` - Express + TypeScript, `better-sqlite3` for storage, cookie
  sessions (custom SQLite-backed session store).
- `client/` - React + Vite + TypeScript.
- `deploy/` - EC2 + Caddy deployment docs (see `deploy/DEPLOY.md`).

## Running locally

```bash
npm install
npm run dev
```

This runs the Express API on `:3001` and the Vite dev server on `:5173`
(which proxies `/api` to the Express server). Open `http://localhost:5173`.

## Building for production

```bash
npm run build   # builds server/dist and client/dist
npm start       # runs the Express server, which also serves client/dist
```

In production the Express server serves the built client directly, so only
one process/port is needed - see `deploy/DEPLOY.md` for the full EC2 setup.

## Rules data

`server/src/rules/priority-tables.ts` and `server/src/rules/lifepath-modules.ts`
are transcribed from the SR6e core rulebook and Companion PDFs already on
disk one directory up. The Priority system tables are complete. The Life
Path module catalog is a **curated starting subset** (the 3 mandatory
starting modules, plus 16 Choices modules and 9 Event modules covering
modules A-C alphabetically) - the Companion has several dozen more Choices
and Event modules across pp. 33-47 that haven't been transcribed yet. Adding
more is pure data entry against the existing schema in that file.

Known gaps to fill in later:
- Remaining Adult Life Modules (D onward).
- "Coming of Age" starting module's full grant list wasn't fully captured
  from the source PDF - see the `TODO` note in `lifepath-modules.ts`.
- Contact purchasing UI (connection/loyalty spending against earned contact
  points) isn't built yet - contact points are shown per-module but not yet
  spendable in the builder.
- Gear/lifestyle spending UI (nuyen is tracked as a running total but not
  yet spent on anything).
