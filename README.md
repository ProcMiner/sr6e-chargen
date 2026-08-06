# SR6e Character Generator

A web app for building Shadowrun 6th Edition characters, supporting both the
core rulebook's **Priority System** and the SR6 Companion's **Life Path**
(Life Modules) system. Built for a small group of friends to log in and keep
their characters saved between sessions.

## Stack

- `server/` - Express + TypeScript, `better-sqlite3` for storage, cookie
  sessions (custom SQLite-backed session store).
- `client/` - React + Vite + TypeScript.
- `deploy/` - Lightsail + Caddy deployment docs (see `deploy/DEPLOY.md`).

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
one process/port is needed - see `deploy/DEPLOY.md` for the full Lightsail
setup.

## Rules data

`server/src/rules/priority-tables.ts`, `server/src/rules/lifepath-modules.ts`,
and `server/src/rules/qualities.ts` are transcribed from the SR6e core
rulebook and sourcebook PDFs already on disk one directory up.

- **Priority System**: tables complete, including the Metatype column's
  Adjustment Points (spent on Edge, pushing a racial attribute above 6, or
  boosting Magic/Resonance above its base rating). **House rule (not RAW)**:
  a checkbox next to each "special racial attribute" (any attribute whose
  metatype max exceeds 6) lets its entire value be funded from Adjustment
  Points instead of just the portion above 6, freeing the equivalent
  Attribute Points to spend elsewhere. RAW's Adjustment Points have no other
  sink once Edge/Magic/Resonance are covered, so high-Adjustment-Point
  metatypes (Troll, Ork, Dwarf) can otherwise end up with unspendable
  leftover points - a Priority-A Troll has 13 Adjustment Points but RAW can
  only ever spend at most 11 of them (5 on Edge, 3 each on Body/Strength's
  excess above 6), even maxing everything out. See
  `PrioritySystemState.adjustmentFundedAttributes` in `character.ts` and
  `PriorityBuilder.tsx`'s `isAdjustmentFunded`/`toggleAdjustmentFunding`.
  Off by default per character (nothing is force-migrated), so existing
  saved characters are unaffected until a player opts in.
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
- **Gear**: chunked to align with the Sixth World Companion's own PACKs
  taxonomy rather than done as one pass - see `gear.ts` for the chunking
  rationale and remaining-chunks roadmap below. **Weapons** chunk complete:
  ~100 entries from the core rulebook's Weapons chapter (melee, thrown,
  tasers, all firearm classes, launchers, accessories, ammo, explosives).
  Buying gear against earned nuyen works in the builder (`GearPicker`); a
  known gap is flagged in `gear.ts`'s header (ammo type cost multipliers
  aren't purchasable yet, they don't fit the flat-cost catalog model).
  **Armor** chunk complete: Clothes, Armor, Armor Modifications, and
  Helmets & Shields (`armor.ts`, core rulebook pp. 265-267) - a smaller
  chunk than originally estimated, since pp. 268-278 turned out to be
  Electronics/ID & Credit/Tools content, not Armor (corrected after reading
  the pages directly; see the roadmap below for where that content landed).
  **General/survival/security gear** chunk complete: Security and
  Restraints, Breaking and Entering Gear, Industrial Chemicals, Survival
  Gear, Grapple Gun & Rope, and Biotech incl. Slap Patches/DocWagon
  Contracts (`generalGear.ts`, core rulebook pp. 278-282). One pricing gap
  flagged in its header: Tranq Patch's quadratic (Rating x Rating x 10¥)
  cost formula doesn't fit the flat per-level model (only its Rating 1 price
  is catalogued). Its other flagged gap - a priced Sensors table it
  cross-references - turned out to live in the Electronics chunk below, not
  missing after all.
  **Electronics & software** chunk complete: Commlinks, Cyberdecks,
  Accessories, RFID Tags, Communications & Countermeasures, Software, ID &
  Credit, Tools, Optical & Imaging Devices, Visual Enhancements, Auditory
  Devices, Audio Enhancements, and Sensors (`electronics.ts`, core rulebook
  pp. 267-277) - substantially bigger than the roadmap's original "pp.
  267-273" estimate, since the optics/audio/sensor sections (pp. 274-277)
  weren't named in that scoping at all.
  **Augmentations (cyberware/bioware)** chunk complete: Headware, Eyeware,
  Earware, Bodyware, Cyberlimbs, Cyberlimb Accessories, Cyber Implant
  Weapons, Bioware, and Cultured Bioware (`augmentations.ts`, core rulebook
  pp. 282-293 - the one chunk so far whose page-range estimate held exactly).
  125 entries. This was the chunk blocked on Essence tracking, which now
  exists (see above) - every Essence-costing item here has `essenceCost` set,
  so buying it reduces Essence and caps Magic/Resonance automatically. Also
  needed an architecture fix: `essenceCost` now scales per-level the same way
  `cost` does when `levels` is set (`gearUnitEssenceCost` in
  `client/src/deriveGear.ts`), since most rated cyberware/bioware here prices
  both cost and Essence as "Rating x N." A handful of items (Datalock,
  Olfactory/Taste Booster, Voice Modulator, Internal Air Tank, Retinal
  Duplication, Select Sound Filter) print a flat Essence cost that does NOT
  scale with rating while their nuyen cost does - catalogued at their Rating
  1 price with the real formula noted in the summary, same treatment as
  General gear's Tranq Patch gap. Implant Grades (Used/Alpha/Beta/Delta cost
  multipliers) aren't modeled - every entry is standard grade only.
  **Magical equipment** chunk complete: Foci, Formulae, and Magical Supplies
  (`magicalEquipment.ts`, core rulebook pp. 294-295). 21 entries. Foci also
  cost Karma to bond, not just nuyen - the first gear item type to need a
  Karma cost, so `GearCatalogEntry`/`GearLine` gained a `bondingKarma` field
  alongside `essenceCost`, and `data.karma` (the character's Karma pool, set
  by `QualityPicker.tsx`) now has a `karmaRemaining` derivation in
  `deriveGear.ts` mirroring `nuyenRemaining` - the Gear picker and Summary
  sheet both show pool/spent/remaining for Karma the same way they do for
  nuyen, and purchases are blocked if either budget is insufficient.
  **Vehicles** chunk complete: Bikes, Cars, Trucks and Vans, Boats,
  Submarines, Fixed-Wing Aircraft, Rotorcraft, and VTOL/VSTOL
  (`vehicles.ts`, core rulebook pp. 295-298). 34 entries, each with a full
  Handling/Acceleration/Speed Interval/Top Speed/Body/Armor/Pilot/Sensor/
  Seats stat block in the free-form `stats` field. Bikes are included even
  though the roadmap's original one-line summary only named "Cars, Trucks
  and Vans, Boats" - they're the same continuous vehicle table in the book,
  just not called out in the chunk's short description. The "Vehicle
  Modifications" table (rigger interface, weapon mounts) that opens this
  section of the book was deliberately left for the separate Vehicle
  upgrades chunk (9).
  **Vehicle upgrades** chunk complete: Rigger Interface, Standard/Heavy
  Weapon Mount, and Manual Operation (`vehicleUpgrades.ts`, core rulebook
  p. 295). Only 4 entries - that's genuinely everything the core rulebook
  prints under "Vehicle Modifications." Done out of roadmap order (before
  Drones) at the user's request, to close out vehicle-adjacent content
  together. The Companion's fuller Vehicle Upgrade PACKs (if it has more
  content beyond the core book) hasn't been checked - same class of gap as
  qualities.ts's sourcebook-by-sourcebook expansion.
  **Drones + Rigger Command Consoles** chunk complete: Microdrones,
  Minidrones, Small/Medium/Large Drones (`drones.ts`, core rulebook pp.
  299-303, continuing directly from Vehicles' stat table sequence - drones
  "use the same statistical block as vehicles" per the book's own text) and
  Rigger Command Console (book pp. 197-198, found in the Rigging chapter,
  not the Gear chapter - located by searching the full book text rather
  than assumed to sit near Drones). 30 entries. Autosofts and RCC-mountable
  programs (Armor, Encryption, Signal Scrubber, Stealth, Toolbox, Virtual
  Machine) are deliberately NOT catalogued here - they're generic-priced
  Matrix programs already covered by the Electronics chunk's "Autosoft" and
  "Cyberprogram, Basic" entries; the book prices them the same way it
  prices any other program, with no separate named/priced catalog per
  autosoft type.

- **Essence tracking**: every character starts at Essence 6.00, derived down
  from gear with an `essenceCost` (cyberware/bioware) via
  `client/src/deriveEssence.ts` - not a separate, isolated number. Per the
  core rulebook (identical phrasing for both attributes), Magic and Resonance
  are capped at `6 - floor(points of Essence lost)`; the Summary sheet shows
  the capped (effective) value and flags when it's below the character's raw
  rating. Initiate/Submersion Grade aren't tracked yet (post-creation Karma
  advancement, not built), so this is the Grade-0 case of that formula - a
  future Grade-tracking feature adds `+ grade` with no call-site changes.
  Exercisable today via the Gear picker's "Add custom item" form (which now
  has an Essence cost field) even though the Augmentations catalog itself
  hasn't shipped yet.

No chargen-core work is currently in progress - pick from the deferred
list below.

Deferred for later:

**Post-creation / character advancement** - once a character is created,
there's no way to update it as play continues. This should become its own
section of the app, separate from the chargen flow:
- Karma spend / post-chargen advancement system (separate from the
  quality-driven portion of the 50-point customization Karma pool already
  wired up via `qualities.ts`) - needs the SR6e Character Advancement karma
  cost table (p. 68) for skills/attributes/gear/qualities. `data.nuyen` is
  already structured for this: it means "total nuyen ever earned" and
  remaining spending money is always derived (`nuyenRemaining` in
  `deriveGear.ts`), so a karma-to-nuyen conversion or run-payout feature
  just adds to `data.nuyen` with no schema change.
- Gear spending UI is now built (`GearPicker`) but only the Weapons catalog
  chunk exists - see the Gear catalog roadmap below for the rest. Lifestyle
  spending isn't covered by any chunk yet either.
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

**Gear catalog roadmap** - chunked to align with the Sixth World Companion's
"Suit Up" chapter, which organizes gear into PACKs (curated bundles) by the
same categories listed below. Each chunk is sized like the Weapons chunk
that's already done: a new `server/src/rules/*.ts` category file, a
`routes/rules.ts` export, no new architecture needed (see `gear.ts`'s header
and `GearCatalogEntry` for the shared shape/conventions).
1. ~~Weapons~~ - done (melee, thrown, tasers, all firearm classes,
   launchers, accessories, ammo, explosives; core rulebook pp. 247-264)
2. ~~Armor~~ - done (Clothes, Armor, Armor Modifications, Helmets & Shields;
   core rulebook pp. 265-267; Companion's Armor PACKs). Page range corrected
   from the original "265-278ish" estimate after reading the pages directly
   - pp. 268-278 turned out to be Electronics/ID & Credit/Tools (folded into
   chunk 4 below) plus the general/survival gear in chunk 3, not Armor.
3. ~~General/survival/security gear~~ - done (Security and Restraints,
   Breaking and Entering Gear, Industrial Chemicals, Survival Gear, Grapple
   Gun & Rope, Biotech incl. Slap Patches/DocWagon Contracts; core rulebook
   pp. 278-282, corrected from the original "278-281" estimate - Biotech
   runs one page longer than first thought). Companion's Identity PACKs maps
   onto the Fake SIN/Fake License entries in chunk 4 (ID and Credit), not
   this chunk. Companion's Surveillance Kit PACK still doesn't have an
   obvious home.
4. ~~Electronics & software base gear~~ - done (Commlinks, Cyberdecks,
   Accessories, RFID Tags, Communications & Countermeasures, Software, ID &
   Credit, Tools, Optical & Imaging Devices, Visual Enhancements, Auditory
   Devices, Audio Enhancements, Sensors; core rulebook pp. 267-277,
   substantially bigger than the original "267-273" estimate - the
   optics/audio/sensor sections weren't named in that scoping at all).
   Companion's Sensor PACKs maps onto the Sensors section here (housings,
   arrays, single sensors) - the "priced Sensors table" chunk 3 couldn't
   locate turned out to live in this chunk, not missing. Companion's
   Cyberprogram Everything PACK maps onto the Software section here.
5. ~~Augmentations~~ - done (Headware, Eyeware, Earware, Bodyware,
   Cyberlimbs, Cyberlimb Accessories, Cyber Implant Weapons, Bioware,
   Cultured Bioware; core rulebook pp. 282-293, the one chunk whose original
   estimate held exactly - Companion's Hacker/Cybereyes/Cyberears/Skill
   Rig/Torso Augmentation PACKs).
6. ~~Magical equipment~~ - done (Foci, Formulae, Magical Supplies; core
   rulebook pp. 294-295).
7. ~~Vehicles~~ - done (Bikes, Cars, Trucks and Vans, Boats, Submarines,
   Fixed-Wing Aircraft, Rotorcraft, VTOL/VSTOL; core rulebook pp. 295-298;
   Companion's Vehicle PACKs).
8. ~~Drones + Rigger Command Consoles~~ - done (Microdrones, Minidrones,
   Small/Medium/Large Drones, Rigger Command Console; core rulebook pp.
   197-198, 299-303; Companion's Drone PACKs, Console PACKs). Autosofts
   were already covered by the Electronics chunk's generic-priced Software
   entries - no separate Drone Autosoft PACK content needed.
9. ~~Vehicle upgrades~~ - done (Rigger Interface, Standard/Heavy Weapon
   Mount, Manual Operation; core rulebook p. 295 - the entirety of what the
   core book prints here). Done ahead of chunk 8 at the user's request.
10. PACK bundle-buying + Complete Character PACKs (capstone) - once enough
    categories above exist, add a `PackCatalogEntry` (id, category, cost,
    `items: {itemId, qty}[]`) + a "buy this PACK" action that expands into
    constituent `GearLine`s at the PACK's flat price, plus the ~15 Complete
    Character PACKs (Companion pp. 49-56: Dirt Poor, Full Magician, Close
    Combat Adept, Face, Gunslinger Adept, Cybered Covert Operative, Decker,
    Full Conversion Cyborg, Street Samurai, Vat Job Bioware-Augmented Combat
    Specialist, Weapons Specialist, Max Hardware Decker, Transport Rigger,
    Drone Rigger, Augmented for Firearms) that bundle across categories.
    Note the dependency: PACKs are just curated bundles of individual items,
    so full fidelity needs those individual items in the catalog first, not
    just PACK-level summaries - this is why it's sequenced last.

**Other deferred items**:
- Spells catalog + picker UI for magicians - core rulebook pp. 130-143
  (Learning Spells, Spell Descriptions, Combat/Detection/Health/Illusion/
  Manipulation Spells, Counterspelling, Ritual Spellcasting). Magic x2 limit
  already noted in rules data comments. The Magical Equipment gear chunk's
  spell formulae (`magicalEquipment.ts`) are catalogued generically by
  category rather than by named spell for exactly this reason - this is
  where the actual spell list belongs.
- Adept Powers picker for Adepts/Mystic Adepts - core rulebook pp. 156-158
  (Power Points, Adept Powers). Not tracked anywhere today: the Priority and
  Life Path builders let a character become an Adept or Mystic Adept and set
  a Magic rating, but there's no picker for spending Power Points on actual
  powers (Improved Reflexes, Killing Hands, Combat Sense, etc.), and no
  Power Points pool is calculated or stored.
- Technomancer "streams" (Hack & Slash, "Resonant Streams," book pp.
  130-131) - a bundled stream-selection system (fixed benefits + an
  "aspect peripheral" power + a purchasable complex form per stream) for
  technomancers/EIs, similar in spirit to the qualities catalog but
  structurally different (it's not a flat list of purchasable qualities).
  Excluded from the qualities catalog for that reason - would need its own
  data model and picker UI if ever implemented.
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

## Ops

- Not urgent, but worth doing sooner rather than later: actually stand up
  the Lightsail instance per `deploy/DEPLOY.md` (the guide is written,
  nothing's deployed yet) so the friend group can use the app over HTTPS and
  help surface real-usage bugs while the deferred features above are still
  being built.
