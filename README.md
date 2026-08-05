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
rulebook and sourcebook PDFs already on disk one directory up.

- **Priority System**: tables complete, including the Metatype column's
  Adjustment Points (spent on Edge, pushing a racial attribute above 6, or
  boosting Magic/Resonance above its base rating).
- **Life Path**: the full Companion catalog is transcribed - all 3 starting
  modules (including Coming of Age's complete grant list: skill, best
  attribute, qualities, nuyen; only its 1-contact grant isn't wired up yet,
  see Post-Creation below), all 75 Choices modules A-Z, and all 11 Event
  modules. One confirmed source gap: Security Guard's Contact Types/
  Knowledge options aren't in the extractable PDF text anywhere, flagged in
  its own `notes` rather than guessed at.
- **Qualities**: 230 entries across the core rulebook and 8 sourcebooks
  (Sixth World Companion, Hack & Slash, Double Clutch, Street Wyrd, Firing
  Squad, Body Shop, Power Plays, No Future). Two core-rulebook entries
  (Astral Beacon, Scorched) are skipped - their Karma/effect text isn't in
  the PDF's extractable text layer, see the `TODO` comment at the top of
  `qualities.ts`. The chargen-time picker enforces the rulebook's cap: max
  6 total qualities, net bonus Karma capped at +20.

No chargen-core work is currently in progress - pick from the deferred
list below.

Deferred for later:

**Post-creation / character advancement** - once a character is created,
there's no way to update it as play continues. This should become its own
section of the app, separate from the chargen flow:
- Karma spend / post-chargen advancement system (separate from the
  quality-driven portion of the 50-point customization Karma pool already
  wired up via `qualities.ts`) - needs the SR6e Character Advancement karma
  cost table (p. 68) for skills/attributes/gear/qualities.
- Gear/lifestyle spending UI (nuyen is tracked as a running total but not
  yet spent on anything) - blocked on the Equipment/gear catalog below.
- Contact purchasing UI (connection/loyalty spending against earned contact
  points) isn't built yet - contact points are shown per-module but not yet
  spendable in the builder. This also covers Coming of Age's own 1-contact
  starting grant, which currently isn't tracked anywhere.

**Character sheet export/print** - no way to get a character out of the
app. Players currently have to keep using the web app during actual play
instead of a printed sheet. Should produce a clean, printable summary
(attributes, skills, derived stats, qualities, gear, contacts) - undecided
whether that's a print-friendly HTML view or a generated PDF.

**Priority System power-level variants** - per the core rulebook's
"Different Levels of Play" sidebar (p. 63), the app should offer an option
alongside standard Priority System chargen for:
- Street-level runner: select priorities as normal, but apply the values
  from one row lower than the chosen letter (e.g. choosing Priority B for
  Attributes actually uses Priority C's attribute points). Since you can't
  go lower than row E, that row gets two selections instead of one.
- Prime runner: double the starting customization Karma from 50 to 100.

**Other deferred items**:
- Equipment/gear catalog (weapons, armor, cyberware, general gear w/ nuyen
  costs) - a prerequisite for the gear-spending UI above. Should include
  Pre-Assembled Character Kits (PACKs) as a purchasable option: the
  Companion's "Suit Up" chapter (book pp. 49-71) has a "Complete Character
  PACKs" section (pp. 49-56 - a shared "Shadowrunner Starter PACK" base
  plus ~15 full-character kits built on top of it: Dirt Poor, Full
  Magician, Close Combat Adept, Face, Gunslinger Adept, Cybered Covert
  Operative, Decker, Full Conversion Cyborg, Street Samurai, Vat Job
  Bioware-Augmented Combat Specialist, Weapons Specialist, Max Hardware
  Decker, Transport Rigger, Drone Rigger, Augmented for Firearms), followed
  by more granular per-category PACKs (Weapons Packs, etc., pp. 56-71).
  Note the dependency: PACKs are just curated bundles of individual items
  (specific guns, armor, augmentations, vehicles, cyberdecks, software), so
  full fidelity needs those individual items in the catalog too, not just
  PACK-level summaries - probably sequence this as base gear catalog first,
  PACKs as a bundling feature on top of it.
- Spells catalog + picker UI for magicians (Magic x2 limit already noted in
  rules data comments).
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
  qualities catalog until AI chargen itself is scoped.
- Technomancer "streams" (Hack & Slash, "Resonant Streams," book pp.
  130-131) - a bundled stream-selection system (fixed benefits + an
  "aspect peripheral" power + a purchasable complex form per stream) for
  technomancers/EIs, similar in spirit to the qualities catalog but
  structurally different (it's not a flat list of purchasable qualities).
  Excluded from the qualities catalog for that reason - would need its own
  data model and picker UI if ever implemented.

## Ops

- Not urgent, but worth doing sooner rather than later: actually stand up
  the EC2 instance per `deploy/DEPLOY.md` (the guide is written, nothing's
  deployed yet) so the friend group can use the app over HTTPS and help
  surface real-usage bugs while the deferred features above are still
  being built.
