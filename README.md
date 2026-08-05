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

`server/src/rules/priority-tables.ts`, `server/src/rules/lifepath-modules.ts`,
and `server/src/rules/qualities.ts` are transcribed from the SR6e core
rulebook and Companion PDFs already on disk one directory up. The Priority
system tables are complete. The Life Path module catalog is a **curated
starting subset** (the 3 mandatory starting modules, plus 16 Choices modules
and 9 Event modules covering modules A-C alphabetically) - the Companion has
several dozen more Choices and Event modules across pp. 33-47 that haven't
been transcribed yet. Adding more is pure data entry against the existing
schema in that file. The Qualities catalog covers the full core-rulebook
chapter (pp. 70-92, 62 of ~63 entries - Positive Qualities are complete;
Negative Qualities are missing only Astral Beacon and Scorched, whose
Karma/effect text isn't present in the PDF's extractable text layer even
after cross-checking both layout modes across the page break, see the
`TODO` comment at the top of `qualities.ts`). The chargen-time quality
picker enforces the rulebook's cap: max 6 total qualities, net bonus Karma
from qualities capped at +20 (verified against both the core rulebook, p.
66, and the Companion's Life Path chapter, p. 30 - not the same numbers as
earlier draft notes here claimed).

Current focus (chargen-core work, in priority order):
1. Remaining Adult Life Modules (D onward) - pure data entry against the
   existing schema in `lifepath-modules.ts`, can now reference real quality
   data from `qualities.ts` for modules with quality slots.
2. "Coming of Age" starting module's full grant list wasn't fully captured
   from the source PDF - see the `TODO` note in `lifepath-modules.ts`.

Deferred for later:
- Equipment/gear catalog (weapons, armor, cyberware, general gear w/ nuyen
  costs) and a shopping UI to spend the `nuyen` total tracked on
  CharacterData.
- Spells catalog + picker UI for magicians (Magic x2 limit already noted in
  rules data comments).
- Karma spend / post-chargen advancement system (separate from the
  quality-driven portion of the 50-point customization Karma pool already
  wired up via `qualities.ts`) - needs the SR6e Character Advancement karma
  cost table (p. 68) for skills/attributes/gear.
- Contact purchasing UI (connection/loyalty spending against earned contact
  points) isn't built yet - contact points are shown per-module but not yet
  spendable in the builder.
- Gear/lifestyle spending UI (nuyen is tracked as a running total but not
  yet spent on anything).
- Astral Beacon and Scorched qualities (see above), plus the Companion's
  additional qualities (pp. 132-138) and its "Quality Paths" narrative
  advancement system (pp. 138-143) - out of scope for the initial catalog,
  same curated-subset precedent as the Life Modules.
- Metatype racial variants (metavariants) and metagenetic qualities - the
  "Born This Way" Life Path module's notes already reference choosing a
  metavariant and paying/gaining its Karma cost, but only the five base
  metatypes (Human/Elf/Dwarf/Ork/Troll) are implemented anywhere in
  `priority-tables.ts` or the Life Path builder; metavariants aren't in the
  schema or UI yet on either system.
- AI/protosapient character creation - Hack & Slash (pp. 114, 119-120) has
  AI/protosapient-only qualities, and presumably a full alternate chargen
  path to go with them, but the app has no AI character type anywhere in
  the schema (Priority or Life Path). Those qualities are excluded from the
  sourcebook qualities pass (see below) until AI chargen itself is scoped.
- Technomancer "streams" (Hack & Slash, "Resonant Streams," book pp.
  130-131) - a bundled stream-selection system (fixed benefits + an
  "aspect peripheral" power + a purchasable complex form per stream) for
  technomancers/EIs, similar in spirit to the qualities catalog but
  structurally different (it's not a flat list of purchasable qualities).
  Excluded from the qualities pass in `qualities.ts` for that reason -
  would need its own data model and picker UI if ever implemented.

## Ops

- Not urgent, but worth doing before the chargen-core work above is fully
  wrapped: actually stand up the EC2 instance per `deploy/DEPLOY.md` (the
  guide is written, nothing's deployed yet) so the friend group can use the
  app over HTTPS and help surface real-usage bugs while later features are
  still being built.
