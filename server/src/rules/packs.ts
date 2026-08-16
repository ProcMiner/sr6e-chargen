// PACK bundle catalog - tenth and final gear-rollout chunk (see gear.ts's
// header for the chunking rationale; see README's Gear catalog roadmap for
// chunk ordering). Unlike every prior chunk, this one is sourced from the
// Sixth World Companion ("Suit Up" chapter, pp. 49-71), not the core
// rulebook - the core rulebook has no PACKs of its own.
//
// PACKs are pre-costed bundles of gear that already exists in the catalogs
// built by chunks 1-9 (`gear.ts`, `armor.ts`, `generalGear.ts`,
// `electronics.ts`, `augmentations.ts`, `magicalEquipment.ts`, `vehicles.ts`,
// `vehicleUpgrades.ts`, `drones.ts`) - a PackCatalogEntry never introduces a
// new physical item, only a named, flat-priced list of `{itemId, qty}`
// references into those catalogs. Buying a PACK expands into real GearLines
// (see client/src/derivePacks.ts) rather than being its own kind of
// purchase, so Essence/Karma/nuyen accounting for PACK contents works
// exactly like a manual purchase would.
//
// The Companion's PACKs split into two structurally different tiers, both
// now built:
// - Category PACKs (Weapons, Armor, Sensor, Identity, Augmentation,
//   Console, Drone Autosoft - pp. 56-71): flat, fixed item lists at one
//   stated price.
// - Complete Character PACKs (16 entries incl. the small standalone
//   "Augmented for Firearms PACK", pp. 49-55): full-nuyen pre-built
//   character kits. This needed the Lifestyle-tracking gap closed first
//   (see client/src/deriveLifestyle.ts) and two new PackCatalogEntry
//   fields - `includesPackId` (for "Included PACK: Shadowrunner Starter
//   PACK", resolved one level deep by explodePackToGearLines) and
//   `lifestyle` (a granted lifestyle-month, overriding rather than
//   stacking with whatever the nested PACK would have granted - matches
//   the book's "upgraded from starter PACK" language). Only augmentations
//   (Essence), foci (Karma bonding), lifestyle, and one representative
//   vehicle/drone/RCC/cyberdeck anchor are itemized per PACK; the rest of
//   each PACK's large item list (weapons, armor, accessories, extra fake
//   licenses) is folded into the automatic bundle-adjustment line, same
//   simplification precedent the category PACKs already established. A
//   PACK's embedded Karma-only cost (Close Combat Adept's "pay 9 Karma to
//   bond the focus") maps directly onto an existing catalog item
//   (`focus-weapon`) rather than needing new mechanics - Force 3's
//   bondingKarma (3/level) already computes to exactly 9.
//
// Vehicle Upgrade PACKs (book p. 71) remain deferred: they bundle vehicle
// modifications (elemental hardening, nitro boost, rigger cocoon, gun
// ports, etc.) that source from Double Clutch (the Rigger sourcebook) and
// don't exist in this app's gear catalog yet - only the core rulebook's
// basic 4-entry vehicle upgrade set does (vehicleUpgrades.ts). Confirmed
// with the user this stays its own separate follow-on chunk.
//
// Known gaps/simplifications in this pass, flagged per-entry where they
// occur rather than silently guessed at:
// - A few PACKs specify a cyberware/bioware Grade (Used/Alpha/Beta/Delta,
//   book p. 282) that augmentations.ts's header already flags as
//   unmodeled - approximated with the standard-grade catalog entry, noted
//   in the affected PACK's summary. The book states an exact Essence Cost
//   for some of these PACKs as a printed cross-check; the approximated
//   total will NOT match that printed figure, and the summary says so.
// - A couple of PACKs have an embedded "choose type/target" sub-list (e.g.
//   Sensor PACKs' Handheld Sensor, Identity PACKs' "2 fake licenses...
//   specify") - defaulted to one reasonable choice with the full option
//   list in the summary, same "choose via notes field" precedent used by
//   magicalEquipment.ts's Spell/Spirit Focus.
// - Console/Drone Autosoft PACKs reference generically-priced Matrix
//   programs (Autosoft, Cyberprogram, Basic) already catalogued in
//   electronics.ts rather than named per-type entries - same treatment
//   drones.ts already gave RCC-mountable programs.

export interface PackCatalogEntry {
  id: string;
  name: string;
  /** Broad grouping key, e.g. "weapon-pack" - opaque string, not a fixed union, matching GearCatalogEntry.category. */
  category: string;
  /** Narrower grouping for the picker UI, e.g. "Heavy Pistols". */
  subcategory?: string;
  /** The book's stated flat nuyen price for the whole bundle. */
  cost: number;
  summary: string;
  /** References into the existing gear catalogs (gear.ts, armor.ts, etc.) - not new items of their own. */
  items: { itemId: string; qty: number; rating?: number; notes?: string }[];
  /** Another PACK's id whose contents are folded in ("Included PACK: Shadowrunner Starter PACK") - resolved one level deep by explodePackToGearLines, since no PACK in this book nests two levels. */
  includesPackId?: string;
  /** A lifestyle this PACK grants (one month). Overrides, doesn't stack with, any lifestyle from includesPackId's nested PACK - matches the book's "upgraded from starter PACK" language. */
  lifestyle?: { itemId: string; months: number };
}

export const packs: PackCatalogEntry[] = [
  // --- Weapons PACKs (Companion pp. 56-58) ---
  // Each entry references the base weapon by its real catalog id; the
  // accessories/ammo/discount that make up the rest of the PACK's stated
  // price are absorbed into the automatic bundle-adjustment line (see
  // derivePacks.ts) rather than individually itemized, since none of them
  // carry Essence or Karma cost - full contents are listed in `summary` for
  // player reference. Ammo type (explosive/gel/flechette/APDS/stick-n-shock)
  // isn't separately purchasable in this catalog at all (gear.ts's own
  // header already flags this - only a flat per-weapon-class price exists),
  // so it's folded into that adjustment amount along with any real bundle
  // discount, rather than misrepresented as a specific ammo type it isn't.
  // "Throwback" (no wireless/smartlink) and "short-barrel modification" are
  // flavor/build descriptors, not separately priced catalog items.
  // "Uzi IV" (as printed) is transcribed as "Uzi V" - the core rulebook's
  // actual name for this weapon (`gear.ts`'s `uzi-v`); "IV" appears to be a
  // PDF extraction misread of the roman numeral, not a different weapon.
  {
    id: "pack-ares-light-fire-75",
    name: "Ares Light Fire 75 PACK",
    category: "weapon-pack",
    subcategory: "Light Pistols",
    cost: 1700,
    summary:
      "Ares Light Fire 75 with specialized silencer, hidden arm slide, 5 spare clips, 100 regular rounds, 100 gel rounds.",
    items: [{ itemId: "ares-light-fire-75", qty: 1 }],
  },
  {
    id: "pack-beretta-201t",
    name: "Beretta 201T PACK",
    category: "weapon-pack",
    subcategory: "Light Pistols",
    cost: 1250,
    summary:
      "Beretta 201T with external smartgun system, gas-vent system, hidden arm slide, 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "beretta-201t", qty: 1 }],
  },
  {
    id: "pack-ruger-redhawk",
    name: "Ruger Redhawk PACK",
    category: "weapon-pack",
    subcategory: "Light Pistols",
    cost: 1675,
    summary:
      "Ruger Redhawk with internal smartgun system, top-mounted laser sight, hidden arm slide, 5 speed loaders, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "ruger-redhawk", qty: 1 }],
  },
  {
    id: "pack-ares-crusader-ii",
    name: "Ares Crusader II PACK",
    category: "weapon-pack",
    subcategory: "Machine Pistols",
    cost: 770,
    summary: "Ares Crusader II with concealable holster, 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "ares-crusader-ii", qty: 1 }],
  },
  {
    id: "pack-ceska-black-scorpion-smartgun",
    name: "Ceska Black Scorpion PACK (Smartgun)",
    category: "weapon-pack",
    subcategory: "Machine Pistols",
    cost: 1860,
    summary:
      "Ceska Black Scorpion with internal smartgun system, concealable holster, gas-vent system, 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "ceska-black-scorpion", qty: 1 }],
  },
  {
    id: "pack-ceska-black-scorpion-laser",
    name: "Ceska Black Scorpion PACK (Laser Sight)",
    category: "weapon-pack",
    subcategory: "Machine Pistols",
    cost: 1485,
    summary:
      "Ceska Black Scorpion with top-mounted laser sight, concealable holster, gas-vent system, 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "ceska-black-scorpion", qty: 1 }],
  },
  {
    id: "pack-steyr-tmp",
    name: "Steyr TMP PACK",
    category: "weapon-pack",
    subcategory: "Machine Pistols",
    cost: 1540,
    summary: "Steyr TMP with suppressor, concealable holster, 5 spare clips, 100 regular rounds, 100 gel rounds.",
    items: [{ itemId: "steyr-tmp", qty: 1 }],
  },
  {
    id: "pack-ares-predator-vi-quickdraw",
    name: "Ares Predator VI PACK (Quickdraw)",
    category: "weapon-pack",
    subcategory: "Heavy Pistols",
    cost: 1850,
    summary:
      "Ares Predator VI with quickdraw holster, gas-vent system, 5 spare variable ammunition clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "ares-predator-vi", qty: 1 }],
  },
  {
    id: "pack-ares-predator-vi-concealable",
    name: "Ares Predator VI PACK (Concealable)",
    category: "weapon-pack",
    subcategory: "Heavy Pistols",
    cost: 1750,
    summary:
      "Ares Predator VI with concealable holster, silencer, 5 spare variable ammunition clips, 100 regular rounds, 100 gel rounds.",
    items: [{ itemId: "ares-predator-vi", qty: 1 }],
  },
  {
    id: "pack-ares-viper-slivergun",
    name: "Ares Viper Slivergun PACK",
    category: "weapon-pack",
    subcategory: "Heavy Pistols",
    cost: 1675,
    summary:
      "Ares Viper Slivergun with internal smartgun system, top-mounted laser sight, concealable holster, 5 spare clips, 150 flechette rounds.",
    items: [{ itemId: "ares-viper-slivergun", qty: 1 }],
  },
  {
    id: "pack-colt-manhunter-quickdraw",
    name: "Colt Manhunter PACK (Quickdraw)",
    category: "weapon-pack",
    subcategory: "Heavy Pistols",
    cost: 1325,
    summary:
      "Colt Manhunter (throwback) with quickdraw holster, gas-vent system, 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "colt-government-2076-manhunter", qty: 1 }],
  },
  {
    id: "pack-colt-manhunter-concealable",
    name: "Colt Manhunter PACK (Concealable)",
    category: "weapon-pack",
    subcategory: "Heavy Pistols",
    cost: 1200,
    summary:
      "Colt Manhunter (throwback) with concealable holster, silencer, 5 spare clips, 100 regular rounds, 100 gel rounds.",
    items: [{ itemId: "colt-government-2076-manhunter", qty: 1 }],
  },
  {
    id: "pack-ruger-super-warhawk-smartgun",
    name: "Ruger Super Warhawk PACK (Smartgun)",
    category: "weapon-pack",
    subcategory: "Heavy Pistols",
    cost: 2050,
    summary:
      "Ruger Super Warhawk with external smartgun system (vision magnification), quickdraw holster, 5 speed loaders, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "ruger-super-warhawk", qty: 1 }],
  },
  {
    id: "pack-ruger-super-warhawk-laser",
    name: "Ruger Super Warhawk PACK (Laser Sight)",
    category: "weapon-pack",
    subcategory: "Heavy Pistols",
    cost: 1150,
    summary:
      "Ruger Super Warhawk (throwback) with top-mounted laser sight, quickdraw holster, 4 speed loaders, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "ruger-super-warhawk", qty: 1 }],
  },
  {
    id: "pack-defiance-t-250-laser",
    name: "Short-Barrel Defiance T-250 PACK (Laser Sight)",
    category: "weapon-pack",
    subcategory: "Shotguns",
    cost: 1175,
    summary:
      "Defiance T-250 (short-barrel modification, throwback) with top-mounted laser sight, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "defiance-t-250", qty: 1 }],
  },
  {
    id: "pack-defiance-t-250-smartgun",
    name: "Short-Barrel Defiance T-250 PACK (Smartgun)",
    category: "weapon-pack",
    subcategory: "Shotguns",
    cost: 1250,
    summary: "Defiance T-250 (short-barrel modification) with external smartgun system, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "defiance-t-250", qty: 1 }],
  },
  {
    id: "pack-mossberg-cmdt-throwback",
    name: "Mossberg CMDT PACK (Throwback)",
    category: "weapon-pack",
    subcategory: "Shotguns",
    cost: 1470,
    summary: "Mossberg CMDT (throwback) with 4 spare drums, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "mossberg-cmdt", qty: 1 }],
  },
  {
    id: "pack-mossberg-cmdt-smartgun",
    name: "Mossberg CMDT PACK (Smartgun)",
    category: "weapon-pack",
    subcategory: "Shotguns",
    cost: 1970,
    summary: "Mossberg CMDT with internal smartgun system, 4 spare drums, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "mossberg-cmdt", qty: 1 }],
  },
  {
    id: "pack-remington-roomsweeper",
    name: "Remington Roomsweeper PACK",
    category: "weapon-pack",
    subcategory: "Shotguns",
    cost: 875,
    summary: "Remington Roomsweeper with external smartgun system, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "remington-roomsweeper", qty: 1 }],
  },
  {
    id: "pack-colt-cobra-tz-120",
    name: "Colt Cobra TZ-120 PACK",
    category: "weapon-pack",
    subcategory: "Submachine Guns",
    cost: 1215,
    summary: "Colt Cobra TZ-120 (throwback) with 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "colt-cobra-tz-120", qty: 1 }],
  },
  {
    id: "pack-fn-p93-praetor",
    name: "FN P93 Praetor PACK",
    category: "weapon-pack",
    subcategory: "Submachine Guns",
    cost: 2000,
    summary:
      "FN P93 Praetor with external smartgun system (vision magnification), 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "fn-p93-praetor", qty: 1 }],
  },
  {
    id: "pack-hk-227",
    name: "HK-227 PACK",
    category: "weapon-pack",
    subcategory: "Submachine Guns",
    cost: 1225,
    summary: "HK-227 with top-mounted laser sight, 5 spare clips, 100 regular rounds, 100 gel rounds.",
    items: [{ itemId: "hk-227", qty: 1 }],
  },
  {
    id: "pack-ingram-smartgun-xi",
    name: "Ingram Smartgun XI PACK",
    category: "weapon-pack",
    subcategory: "Submachine Guns",
    cost: 1025,
    summary: "Ingram Smartgun XI with 5 spare clips, 100 regular rounds, 100 gel rounds.",
    items: [{ itemId: "ingram-smartgun-xi", qty: 1 }],
  },
  {
    id: "pack-uzi-v",
    name: "Uzi V PACK",
    category: "weapon-pack",
    subcategory: "Submachine Guns",
    cost: 730,
    summary: "Uzi V (throwback) with 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "uzi-v", qty: 1 }],
  },
  {
    id: "pack-ak-97",
    name: "AK-97 PACK",
    category: "weapon-pack",
    subcategory: "Rifles",
    cost: 4500,
    summary:
      "AK-97 with internal smartgun system (vision magnification), top-mounted laser sight, gas-vent system, shock pad, 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "ak-97", qty: 1 }],
  },
  {
    id: "pack-ares-alpha",
    name: "Ares Alpha PACK",
    category: "weapon-pack",
    subcategory: "Rifles",
    cost: 7825,
    summary:
      "Ares Alpha with top-mounted laser sight, gas-vent system, shock pad, 5 spare rifle clips, 100 explosive rounds, 100 gel rounds, 5 spare grenade launcher clips, 6 each stun/fragmentation/high explosive/smoke/thermal smoke grenades.",
    items: [{ itemId: "ares-alpha", qty: 1 }],
  },
  {
    id: "pack-fn-har-smartgun",
    name: "FN-HAR PACK (Smartgun)",
    category: "weapon-pack",
    subcategory: "Rifles",
    cost: 3075,
    summary: "FN-HAR with external smartgun system, shock pad, 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "fn-har", qty: 1 }],
  },
  {
    id: "pack-fn-har-throwback",
    name: "FN-HAR PACK (Throwback)",
    category: "weapon-pack",
    subcategory: "Rifles",
    cost: 2875,
    summary: "FN-HAR (throwback) with shock pad, 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "fn-har", qty: 1 }],
  },
  {
    id: "pack-yamaha-raiden",
    name: "Yamaha Raiden PACK",
    category: "weapon-pack",
    subcategory: "Rifles",
    cost: 6000,
    summary:
      "Yamaha Raiden with shock pad, 5 spare rifle clips, 100 explosive rounds, 100 gel rounds, 5 spare grenade launcher clips, 4 each stun/fragmentation/high explosive/smoke/thermal smoke grenades.",
    items: [{ itemId: "yamaha-raiden", qty: 1 }],
  },
  {
    id: "pack-ares-desert-strike-gas-vent",
    name: "Ares Desert Strike PACK (Gas-Vent)",
    category: "weapon-pack",
    subcategory: "Rifles",
    cost: 12525,
    summary: "Ares Desert Strike with gas-vent system, 5 spare clips, 100 APDS rounds, 100 Stick-n-Shock rounds.",
    items: [{ itemId: "ares-desert-strike", qty: 1 }],
  },
  {
    id: "pack-ares-desert-strike-suppressor",
    name: "Ares Desert Strike PACK (Suppressor)",
    category: "weapon-pack",
    subcategory: "Rifles",
    cost: 12525,
    summary: "Ares Desert Strike with suppressor, 5 spare clips, 100 APDS rounds, 100 Stick-n-Shock rounds.",
    items: [{ itemId: "ares-desert-strike", qty: 1 }],
  },
  {
    id: "pack-cavalier-arms-crockett-ebr",
    name: "Cavalier Arms Crockett EBR PACK",
    category: "weapon-pack",
    subcategory: "Rifles",
    cost: 10900,
    summary:
      "Cavalier Arms Crockett EBR with internal smartgun system, underbarrel laser sight, gas-vent system, 5 spare clips, 100 explosive rounds, 100 gel rounds.",
    items: [{ itemId: "cavalier-arms-crockett-ebr", qty: 1 }],
  },
  {
    id: "pack-ingram-valiant",
    name: "Ingram Valiant PACK",
    category: "weapon-pack",
    subcategory: "Machine Guns",
    cost: 5800,
    summary: "Ingram Valiant with external smartgun system, 5 spare clips, 200 explosive rounds, 200 gel rounds.",
    items: [{ itemId: "ingram-valiant", qty: 1 }],
  },
  {
    id: "pack-stoner-ares-m202",
    name: "Stoner-Ares M202 PACK",
    category: "weapon-pack",
    subcategory: "Machine Guns",
    cost: 10000,
    summary:
      "Stoner-Ares M202 with internal smartgun system (vision magnification), top-mounted laser sight, gas-vent system, shock pad, 5 spare clips, 200 explosive rounds, 200 gel rounds.",
    items: [{ itemId: "stoner-ares-m202", qty: 1 }],
  },
  {
    id: "pack-rpk-hmg",
    name: "RPK HMG PACK",
    category: "weapon-pack",
    subcategory: "Machine Guns",
    cost: 11100,
    summary:
      "RPK HMG with internal smartgun system (vision magnification), top-mounted laser sight, gas-vent system, shock pad, 5 spare clips, 200 explosive rounds, 200 gel rounds.",
    items: [{ itemId: "rpk-hmg", qty: 1 }],
  },
  {
    id: "pack-panther-xxl",
    name: "Panther XXL PACK",
    category: "weapon-pack",
    subcategory: "Machine Guns",
    cost: 10700,
    summary: "Panther XXL with top-mounted laser sight, shock pad, 5 spare clips, 100 assault cannon rounds.",
    items: [{ itemId: "panther-xxl", qty: 1 }],
  },
  {
    id: "pack-armtech-mgl-6",
    name: "ArmTech MGL-6 PACK",
    category: "weapon-pack",
    subcategory: "Launchers",
    cost: 6125,
    summary:
      "ArmTech MGL-6 with airburst link, external smartgun system (vision magnification), 5 spare clips, 6 each stun/fragmentation/high explosive/smoke/thermal smoke grenades.",
    items: [{ itemId: "armtech-mgl-6", qty: 1 }],
  },
  {
    id: "pack-armtech-mgl-12",
    name: "ArmTech MGL-12 PACK",
    category: "weapon-pack",
    subcategory: "Launchers",
    cost: 12325,
    summary:
      "ArmTech MGL-12 with airburst link, external smartgun system (vision magnification), 5 spare clips, 12 each stun/fragmentation/high explosive/smoke/thermal smoke grenades.",
    items: [{ itemId: "armtech-mgl-12", qty: 1 }],
  },
  {
    id: "pack-aztechnology-striker",
    name: "Aztechnology Striker PACK",
    category: "weapon-pack",
    subcategory: "Launchers",
    cost: 15200,
    summary: "Aztechnology Striker (throwback) with 2 fragmentation rockets, 2 high explosive rockets.",
    items: [{ itemId: "aztechnology-striker", qty: 1 }],
  },
  {
    id: "pack-onotari-interceptor",
    name: "Onotari Interceptor PACK",
    category: "weapon-pack",
    subcategory: "Launchers",
    cost: 18300,
    summary: "Onotari Interceptor with vision magnification, airburst link, 2 fragmentation rockets, 2 high explosive rockets.",
    items: [{ itemId: "onotari-interceptor", qty: 1 }],
  },

  // --- Armor PACKs (Companion p. 58) ---
  // Same "base item + adjustment absorbs mods" treatment as Weapons PACKs -
  // resistance mods and vision accessories carry no Essence/Karma cost, so
  // per-item explosion adds no correctness value, only display detail
  // already captured in `summary`. Helmet PACKs all reference the base
  // "helmet" entry with different bundled vision accessories.
  {
    id: "pack-actioneer-business-clothes",
    name: "Actioneer Business Clothes PACK",
    category: "armor-pack",
    subcategory: "Armor",
    cost: 3000,
    summary: "Actioneer Business Clothes with chemical protection 2, cold resistance 1, electricity resistance 1, fire resistance 2.",
    items: [{ itemId: "actioneer-business-clothes", qty: 1 }],
  },
  {
    id: "pack-armor-jacket",
    name: "Armor Jacket PACK",
    category: "armor-pack",
    subcategory: "Armor",
    cost: 3200,
    summary: "Armor Jacket with chemical protection 2, cold resistance 2, electricity resistance 2, fire resistance 2.",
    items: [{ itemId: "armor-jacket", qty: 1 }],
  },
  {
    id: "pack-armor-vest",
    name: "Armor Vest PACK",
    category: "armor-pack",
    subcategory: "Armor",
    cost: 2250,
    summary: "Armor Vest with chemical protection 1, cold resistance 1, electricity resistance 2, fire resistance 2.",
    items: [{ itemId: "armor-vest", qty: 1 }],
  },
  {
    id: "pack-chameleon-suit",
    name: "Chameleon Suit PACK",
    category: "armor-pack",
    subcategory: "Armor",
    cost: 3000,
    summary: "Chameleon Suit with chemical protection 1, cold resistance 1, electricity resistance 1, fire resistance 1.",
    items: [{ itemId: "chameleon-suit", qty: 1 }],
  },
  {
    id: "pack-full-body-armor",
    name: "Full Body Armor PACK",
    category: "armor-pack",
    subcategory: "Armor",
    cost: 7300,
    summary:
      "Full Body Armor with helmet, chemical seal, chemical protection 1, cold resistance 1, electricity resistance 1, fire resistance 1, plus a rating 4 fake license (full body armor).",
    items: [{ itemId: "full-body-armor", qty: 1 }],
  },
  {
    id: "pack-lined-coat",
    name: "Lined Coat PACK",
    category: "armor-pack",
    subcategory: "Armor",
    cost: 2650,
    summary: "Lined Coat with chemical protection 1, cold resistance 2, electricity resistance 2, fire resistance 2.",
    items: [{ itemId: "lined-coat", qty: 1 }],
  },
  {
    id: "pack-urban-explorer-jumpsuit",
    name: "Urban Explorer Jumpsuit PACK",
    category: "armor-pack",
    subcategory: "Armor",
    cost: 2300,
    summary: "Urban Explorer Jumpsuit with chemical protection 2, cold resistance 1, electricity resistance 2, fire resistance 1.",
    items: [{ itemId: "urban-explorer-jumpsuit", qty: 1 }],
  },
  {
    id: "pack-smartlinked-helmet",
    name: "Smartlinked Helmet PACK",
    category: "armor-pack",
    subcategory: "Helmets",
    cost: 2475,
    summary: "Helmet with flare compensation, image link, smartlink.",
    items: [{ itemId: "helmet", qty: 1 }],
  },
  {
    id: "pack-augmented-vision-helmet",
    name: "Augmented Vision Helmet PACK",
    category: "armor-pack",
    subcategory: "Helmets",
    cost: 1975,
    summary: "Helmet with flare compensation, image link, low-light vision, thermographic vision.",
    items: [{ itemId: "helmet", qty: 1 }],
  },
  {
    id: "pack-enhanced-vision-helmet",
    name: "Enhanced Vision Helmet PACK",
    category: "armor-pack",
    subcategory: "Helmets",
    cost: 1200,
    summary: "Helmet with flare compensation, vision enhancement, vision magnification.",
    items: [{ itemId: "helmet", qty: 1 }],
  },

  // --- Sensor PACKs (Companion p. 59) ---
  {
    id: "pack-magical-targeting-kit",
    name: "Magical Targeting Kit PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 3700,
    summary: "Mage sight goggles, 30 meters myomeric rope, optical binoculars, periscope.",
    items: [
      { itemId: "optics-mage-sight-goggles", qty: 1 },
      { itemId: "myomeric-rope", qty: 3 },
      { itemId: "optics-binoculars-optical", qty: 1 },
      { itemId: "optics-periscope", qty: 1 },
    ],
  },
  {
    id: "pack-contacts-elf-eyes",
    name: "Contacts: Elf Eyes PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 1375,
    summary: "Rating 3 contacts with flare compensation, image link, low-light vision.",
    items: [{ itemId: "optics-contacts", qty: 1, rating: 3 }],
  },
  {
    id: "pack-contacts-krime-trog-peeps",
    name: "Contacts: Krime Trog Peeps PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 1375,
    summary: "Rating 3 contacts with flare compensation, image link, thermographic vision.",
    items: [{ itemId: "optics-contacts", qty: 1, rating: 3 }],
  },
  {
    id: "pack-contacts-smartlink",
    name: "Contacts: Smartlink PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 2625,
    summary: "Rating 3 contacts with image link and smartlink.",
    items: [{ itemId: "optics-contacts", qty: 1, rating: 3 }],
  },
  {
    id: "pack-glasses-smart-shades",
    name: "Glasses: Smart Shades PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 1125,
    summary: "Rating 4 glasses with flare compensation, image link, vision enhancement.",
    items: [{ itemId: "optics-glasses", qty: 1, rating: 4 }],
  },
  {
    id: "pack-glasses-enhanced-vision",
    name: "Glasses: Enhanced Vision PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 1175,
    summary: "Rating 4 glasses with image link, vision enhancement, vision magnification.",
    items: [{ itemId: "optics-glasses", qty: 1, rating: 4 }],
  },
  {
    id: "pack-glasses-augmented-vision",
    name: "Glasses: Augmented Vision PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 1675,
    summary: "Rating 4 glasses with flare compensation, image link, low-light vision, thermographic vision.",
    items: [{ itemId: "optics-glasses", qty: 1, rating: 4 }],
  },
  {
    id: "pack-goggles-super-smartgoggles",
    name: "Goggles: Super Smartgoggles PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 3425,
    summary: "Rating 6 goggles with flare compensation, image link, smartlink, low-light vision, vision magnification.",
    items: [{ itemId: "optics-goggles", qty: 1, rating: 6 }],
  },
  {
    id: "pack-ultrasound-contacts",
    name: "Ultrasound Contacts PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 1775,
    summary: "Rating 3 handheld ultrasound sensor plus rating 3 contacts with flare compensation, image link, ultrasound link.",
    items: [
      { itemId: "sensor-handheld-housing", qty: 1, rating: 3 },
      { itemId: "optics-contacts", qty: 1, rating: 3 },
    ],
  },
  {
    id: "pack-ultrasound-glasses",
    name: "Ultrasound Glasses PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 1475,
    summary: "Rating 3 handheld ultrasound sensor plus rating 3 glasses with flare compensation, image link, ultrasound link.",
    items: [
      { itemId: "sensor-handheld-housing", qty: 1, rating: 3 },
      { itemId: "optics-glasses", qty: 1, rating: 3 },
    ],
  },
  {
    id: "pack-ultrasound-goggles",
    name: "Ultrasound Goggles PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 1325,
    summary: "Rating 3 handheld ultrasound sensor plus rating 3 goggles with flare compensation, image link, ultrasound link.",
    items: [
      { itemId: "sensor-handheld-housing", qty: 1, rating: 3 },
      { itemId: "optics-goggles", qty: 1, rating: 3 },
    ],
  },
  {
    id: "pack-handheld-sensor",
    name: "Handheld Sensor PACK",
    category: "sensor-pack",
    subcategory: "Sensor PACKs",
    cost: 1200,
    summary:
      "Rating 3 handheld sensor housing including three rating 3 single sensors - choose one type: Environmental (atmosphere sensor, geiger counter, olfactory scanner), Contraband (cyberware scanner, MAD scanner, olfactory scanner), Ultrasonic (motion sensor, ultrasound sensor, omni-directional microphone - the default used here), or Eavesdropper (directional microphone, laser range finder, laser microphone). Individual sensor functions aren't separately catalogued (electronics.ts only has a generic Single Sensor entry) - specify your chosen type in this line's notes after buying.",
    items: [{ itemId: "sensor-handheld-housing", qty: 1, rating: 3 }],
  },

  // --- Identity PACKs (Companion p. 59) ---
  {
    id: "pack-cheap-fake-id",
    name: "Cheap Fake ID PACK",
    category: "identity-pack",
    subcategory: "Identity PACKs",
    cost: 5800,
    summary: "Rating 2 fake SIN plus 2 rating 2 fake licenses (specify which licenses when buying).",
    items: [
      { itemId: "id-fake-sin", qty: 1, rating: 2 },
      { itemId: "id-fake-license", qty: 2, rating: 2 },
    ],
  },
  {
    id: "pack-risky-fake-id",
    name: "Risky Fake ID PACK",
    category: "identity-pack",
    subcategory: "Identity PACKs",
    cost: 8700,
    summary: "Rating 3 fake SIN plus 2 rating 3 fake licenses (specify which licenses when buying).",
    items: [
      { itemId: "id-fake-sin", qty: 1, rating: 3 },
      { itemId: "id-fake-license", qty: 2, rating: 3 },
    ],
  },
  {
    id: "pack-reliable-fake-id",
    name: "Reliable Fake ID PACK",
    category: "identity-pack",
    subcategory: "Identity PACKs",
    cost: 11600,
    summary: "Rating 4 fake SIN plus 2 rating 4 fake licenses (specify which licenses when buying).",
    items: [
      { itemId: "id-fake-sin", qty: 1, rating: 4 },
      { itemId: "id-fake-license", qty: 2, rating: 4 },
    ],
  },
  {
    id: "pack-solid-fake-id",
    name: "Solid Fake ID PACK",
    category: "identity-pack",
    subcategory: "Identity PACKs",
    cost: 13500,
    summary: "Rating 5 fake SIN plus 2 rating 5 fake licenses (specify which licenses when buying).",
    items: [
      { itemId: "id-fake-sin", qty: 1, rating: 5 },
      { itemId: "id-fake-license", qty: 2, rating: 5 },
    ],
  },
  {
    id: "pack-exquisite-fake-id",
    name: "Exquisite Fake ID PACK",
    category: "identity-pack",
    subcategory: "Identity PACKs",
    cost: 17400,
    summary: "Rating 6 fake SIN plus 2 rating 6 fake licenses (specify which licenses when buying).",
    items: [
      { itemId: "id-fake-sin", qty: 1, rating: 6 },
      { itemId: "id-fake-license", qty: 2, rating: 6 },
    ],
  },
  {
    // Resolves the "no obvious home" gap flagged since the General gear
    // chunk - the Surveillance Kit PACK is its own standalone bundle, not
    // tied to the Sensor PACKs list above.
    id: "pack-surveillance-kit",
    name: "Surveillance Kit PACK",
    category: "identity-pack",
    subcategory: "Surveillance Kit PACK",
    cost: 5000,
    summary:
      "Binoculars (rating 3 w/ low-light vision and vision enhancement), data tap, directional microphone (rating 5 w/ audio enhancement, select sound filter 2, spatial recognizer), laser mic (rating 1 w/ audio enhancement), micro-camera (rating 1 w/ low-light vision), 2 motion sensor tags (rating 2), omnidirectional microphone sensor tag (rating 2), olfactory scanner tag (rating 2), ultrasound sensor tag (rating 1). Individual sensor tag functions aren't separately catalogued (same Sensor Functions gap noted in generalGear.ts/electronics.ts) - represented by a 10-pack of generic Sensor Tags.",
    items: [
      { itemId: "optics-binoculars", qty: 1, rating: 3 },
      { itemId: "comms-data-tap", qty: 1 },
      { itemId: "audio-directional-microphone", qty: 1, rating: 5 },
      { itemId: "audio-laser-mic", qty: 1, rating: 1 },
      { itemId: "optics-micro-camera", qty: 1, rating: 1 },
      { itemId: "rfid-sensor-tags", qty: 1 },
    ],
  },

  // --- Augmentation PACKs (Companion pp. 60-63) ---
  // Hacker PACKs A-F specify a "used" grade Cyberjack, which augmentations.ts
  // doesn't model (Implant Grades aren't implemented there either) -
  // approximated with the standard-grade Cyberjack entry. The book states an
  // exact Essence Cost for these six PACKs as a cross-check; the
  // approximated total will be LOWER than that printed figure (used grade
  // costs MORE Essence than standard, per the Grades table: used = Ess
  // x1.1), and the summary says so - this is the one place in this chunk
  // where the computed Essence total doesn't match the book's own number.
  // Every other Augmentation PACK below (Cybereyes/Cyberears/Skill Rig/
  // limb PACKs) is priced at standard grade already, and its computed
  // Essence total was verified to match the book's printed figure exactly
  // during transcription.
  // "Cyberprogram Everything PACK" (referenced inside most Hacker PACKs) is
  // its own PACK further down (Console PACKs section) - this catalog has no
  // pack-of-packs nesting, so its cost is folded into the adjustment line
  // rather than expanded inline (it carries no Essence/Karma cost, so
  // nothing is lost by doing so).
  {
    id: "pack-hacker-a",
    name: "Hacker PACK A",
    category: "augmentation-pack",
    subcategory: "Hacker PACKs",
    cost: 324670,
    summary:
      "The ultimate decker starting hardware, all cyberware. Cyberjack (rating 6, used), headware cyberdeck (Shiawase Cyber-6), datajack, plus the Cyberprogram Everything PACK. Book Essence Cost: 3.8 (used-grade cyberjack) - approximated here with the standard-grade Cyberjack Rating 6 (Essence 3), so the computed total will read lower than 3.8.",
    items: [
      { itemId: "cyberjack-rating-6", qty: 1 },
      { itemId: "headware-cyberdeck", qty: 1 },
      { itemId: "cyberdeck-shiawase-cyber-6", qty: 1 },
      { itemId: "datajack", qty: 1 },
    ],
  },
  {
    id: "pack-hacker-b",
    name: "Hacker PACK B",
    category: "augmentation-pack",
    subcategory: "Hacker PACKs",
    cost: 215170,
    summary:
      "A serious hacker's kit for over 100,000 nuyen less than PACK A. Cyberjack (rating 6, used), headware cyberdeck (Renraku Kitsune), datajack, plus the Cyberprogram Everything PACK. Book Essence Cost: 3.8 (used-grade) - approximated with standard-grade Cyberjack Rating 6, computed total reads lower.",
    items: [
      { itemId: "cyberjack-rating-6", qty: 1 },
      { itemId: "headware-cyberdeck", qty: 1 },
      { itemId: "cyberdeck-renraku-kitsune", qty: 1 },
      { itemId: "datajack", qty: 1 },
    ],
  },
  {
    id: "pack-hacker-c",
    name: "Hacker PACK C",
    category: "augmentation-pack",
    subcategory: "Hacker PACKs",
    cost: 184170,
    summary:
      "A bargain hacker kit, the lowest tier recommended for a serious hacker. Cyberjack (rating 5, used), headware cyberdeck (Renraku Kitsune), datajack, plus the Cyberprogram Everything PACK. Book Essence Cost: 3.36 (used-grade) - approximated with standard-grade Cyberjack Rating 5, computed total reads lower.",
    items: [
      { itemId: "cyberjack-rating-5", qty: 1 },
      { itemId: "headware-cyberdeck", qty: 1 },
      { itemId: "cyberdeck-renraku-kitsune", qty: 1 },
      { itemId: "datajack", qty: 1 },
    ],
  },
  {
    id: "pack-hacker-d",
    name: "Hacker PACK D",
    category: "augmentation-pack",
    subcategory: "Hacker PACKs",
    cost: 162670,
    summary:
      "For when you're tight on Essence and nuyen but still need to hack. Cyberjack (rating 4, used), headware cyberdeck (Renraku Kitsune), datajack, plus the Cyberprogram Everything PACK. Book Essence Cost: 3.03 (used-grade) - approximated with standard-grade Cyberjack Rating 4, computed total reads lower.",
    items: [
      { itemId: "cyberjack-rating-4", qty: 1 },
      { itemId: "headware-cyberdeck", qty: 1 },
      { itemId: "cyberdeck-renraku-kitsune", qty: 1 },
      { itemId: "datajack", qty: 1 },
    ],
  },
  {
    id: "pack-hacker-e",
    name: "Hacker PACK E",
    category: "augmentation-pack",
    subcategory: "Hacker PACKs",
    cost: 129170,
    summary:
      "An inexpensive kit, good for hacking as a secondary skillset. Cyberjack (rating 4, used), headware cyberdeck (Spinrad Falcon), datajack, plus the Cyberprogram Everything PACK. Book Essence Cost: 3.06 (used-grade) - approximated with standard-grade Cyberjack Rating 4, computed total reads lower.",
    items: [
      { itemId: "cyberjack-rating-4", qty: 1 },
      { itemId: "headware-cyberdeck", qty: 1 },
      { itemId: "cyberdeck-spinrad-falcon", qty: 1 },
      { itemId: "datajack", qty: 1 },
    ],
  },
  {
    id: "pack-hacker-f",
    name: "Hacker PACK F",
    category: "augmentation-pack",
    subcategory: "Hacker PACKs",
    cost: 64870,
    summary:
      "The cheapest kit that can still reasonably hack. Cyberjack (rating 3, used), headware cyberdeck (Erika MCD-6), datajack, plus Baby Monitor and Signal Scrub cyberprograms. Book Essence Cost: 2.8 (used-grade) - approximated with standard-grade Cyberjack Rating 3, computed total reads lower.",
    items: [
      { itemId: "cyberjack-rating-3", qty: 1 },
      { itemId: "headware-cyberdeck", qty: 1 },
      { itemId: "cyberdeck-erika-mcd-6", qty: 1 },
      { itemId: "datajack", qty: 1 },
      { itemId: "software-cyberprogram-basic", qty: 2 },
    ],
  },
  {
    id: "pack-cybereyes-a",
    name: "Cybereyes PACK A",
    category: "augmentation-pack",
    subcategory: "Cybereyes PACKs",
    cost: 24500,
    summary: "Cybereyes (rating 4) with flare compensation, low-light vision, smartlink, thermographic vision, vision enhancement, vision magnification.",
    items: [{ itemId: "cybereyes-rating-4", qty: 1 }],
  },
  {
    id: "pack-cybereyes-b",
    name: "Cybereyes PACK B",
    category: "augmentation-pack",
    subcategory: "Cybereyes PACKs",
    cost: 15500,
    summary: "Cybereyes (rating 3, no smartlink) with low-light vision, thermographic vision, vision enhancement, vision magnification.",
    items: [{ itemId: "cybereyes-rating-3", qty: 1 }],
  },
  {
    id: "pack-cybereyes-c",
    name: "Cybereyes PACK C",
    category: "augmentation-pack",
    subcategory: "Cybereyes PACKs",
    cost: 14500,
    summary: "Cybereyes (rating 3) with flare compensation, low-light vision, smartlink, thermographic vision.",
    items: [{ itemId: "cybereyes-rating-3", qty: 1 }],
  },
  {
    id: "pack-cybereyes-d",
    name: "Cybereyes PACK D",
    category: "augmentation-pack",
    subcategory: "Cybereyes PACKs",
    cost: 11000,
    summary: "Cybereyes (rating 2) with just flare compensation and smartlink.",
    items: [{ itemId: "cybereyes-rating-2", qty: 1 }],
  },
  {
    id: "pack-cybereyes-e",
    name: "Cybereyes PACK E",
    category: "augmentation-pack",
    subcategory: "Cybereyes PACKs",
    cost: 5500,
    summary: "Cybereyes (rating 2) with low-light vision and thermographic vision.",
    items: [{ itemId: "cybereyes-rating-2", qty: 1 }],
  },
  {
    id: "pack-cyberears-a",
    name: "Cyberears PACK A",
    category: "augmentation-pack",
    subcategory: "Cyberears PACKs",
    cost: 39750,
    summary: "Cyberears (rating 4) with audio enhancement, balance augmenter, damper, select sound filter rating 4, spatial recognizer.",
    items: [{ itemId: "cyberears-rating-4", qty: 1 }],
  },
  {
    id: "pack-cyberears-b",
    name: "Cyberears PACK B",
    category: "augmentation-pack",
    subcategory: "Cyberears PACKs",
    cost: 31750,
    summary: "Cyberears (rating 4) with audio enhancement, damper, select sound filter rating 6 (no balance augmenter).",
    items: [{ itemId: "cyberears-rating-4", qty: 1 }],
  },
  {
    id: "pack-cyberears-c",
    name: "Cyberears PACK C",
    category: "augmentation-pack",
    subcategory: "Cyberears PACKs",
    cost: 28750,
    summary: "Cyberears (rating 4) with audio enhancement, damper, select sound filter rating 4, spatial recognizer (no balance augmenter).",
    items: [{ itemId: "cyberears-rating-4", qty: 1 }],
  },
  {
    id: "pack-cyberears-d",
    name: "Cyberears PACK D",
    category: "augmentation-pack",
    subcategory: "Cyberears PACKs",
    cost: 22750,
    summary: "Cyberears (rating 3) with audio enhancement, balance augmenter, damper, spatial recognizer (no sound filter).",
    items: [{ itemId: "cyberears-rating-3", qty: 1 }],
  },
  {
    id: "pack-cyberears-e",
    name: "Cyberears PACK E",
    category: "augmentation-pack",
    subcategory: "Cyberears PACKs",
    cost: 13250,
    summary: "Cyberears (rating 2) with audio enhancement, damper, spatial recognizer.",
    items: [{ itemId: "cyberears-rating-2", qty: 1 }],
  },
  {
    id: "pack-skill-rig-a",
    name: "Skill Rig PACK A",
    category: "augmentation-pack",
    subcategory: "Skill Rig PACKs",
    cost: 270000,
    summary:
      "Skilljack (rating 6) + skillwires (rating 6), can run two rating 6 activesofts at once (one included; choose its skill after buying). Additional rating 6 activesofts are 30,000 nuyen each.",
    items: [
      { itemId: "skilljack", qty: 1, rating: 6 },
      { itemId: "skillwires", qty: 1, rating: 6 },
      { itemId: "software-activesofts", qty: 1, rating: 6 },
    ],
  },
  {
    id: "pack-skill-rig-b",
    name: "Skill Rig PACK B",
    category: "augmentation-pack",
    subcategory: "Skill Rig PACKs",
    cost: 200000,
    summary:
      "Skilljack (rating 5) + skillwires (rating 5), can run two rating 5 activesofts at once (one included; choose its skill after buying). Additional rating 5 activesofts are 25,000 nuyen each.",
    items: [
      { itemId: "skilljack", qty: 1, rating: 5 },
      { itemId: "skillwires", qty: 1, rating: 5 },
      { itemId: "software-activesofts", qty: 1, rating: 5 },
    ],
  },
  {
    id: "pack-skill-rig-c",
    name: "Skill Rig",
    category: "augmentation-pack",
    subcategory: "Skill Rig PACKs",
    cost: 160000,
    summary:
      "Skilljack (rating 4) + skillwires (rating 4), can run two rating 4 activesofts (one included; choose its skill after buying). Additional rating 4 activesofts are 20,000 nuyen each. Printed in the book simply as \"Skill Rig,\" no PACK letter.",
    items: [
      { itemId: "skilljack", qty: 1, rating: 4 },
      { itemId: "skillwires", qty: 1, rating: 4 },
      { itemId: "software-activesofts", qty: 1, rating: 4 },
    ],
  },
  {
    id: "pack-all-in-the-reflexes",
    name: "All in the Reflexes",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 180000,
    summary:
      "Standard for street samurai and elite corp security. Wired reflexes (rating 2) + reaction enhancers (rating 2) - brings you to your augmented Reaction maximum and grants extra Minor Actions.",
    items: [
      { itemId: "wired-reflexes-2", qty: 1 },
      { itemId: "reaction-enhancers", qty: 1, rating: 2 },
    ],
  },
  {
    id: "pack-thick-skull",
    name: "Thick Skull",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 25000,
    summary: "Cyberskull (synthetic) with armor 2. +2 Defense Rating, +1 box to Physical Condition Monitor, looks completely natural.",
    items: [
      { itemId: "cyberlimb-skull-synthetic", qty: 1 },
      { itemId: "cyberlimb-acc-armor", qty: 1, rating: 2 },
    ],
  },
  {
    id: "pack-chrome-dome",
    name: "Chrome Dome",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 30000,
    summary: "Cyberskull (obvious) with armor 4. More head armor, but obviously cybernetic.",
    items: [
      { itemId: "cyberlimb-skull-obvious", qty: 1 },
      { itemId: "cyberlimb-acc-armor", qty: 1, rating: 4 },
    ],
  },
  {
    id: "pack-stealth-torso",
    name: "Stealth Torso",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 31000,
    summary: "Cybertorso (synthetic) with a smuggling compartment. Favorite of discreet couriers and smugglers; +1 box to Physical Condition Monitor.",
    items: [
      { itemId: "cyberlimb-torso-synthetic", qty: 1 },
      { itemId: "cyberlimb-acc-smuggling-compartment", qty: 1 },
    ],
  },
  {
    id: "pack-hidden-armor-torso",
    name: "Hidden Armor Torso",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 50000,
    summary: "Cybertorso (synthetic) with armor 5. Subtle +5 Defense Rating boost plus +1 box to Physical Condition Monitor.",
    items: [
      { itemId: "cyberlimb-torso-synthetic", qty: 1 },
      { itemId: "cyberlimb-acc-armor", qty: 1, rating: 5 },
    ],
  },
  {
    id: "pack-cyborg-torso",
    name: "Cyborg Torso",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 51000,
    summary: "Cybertorso (obvious) with armor 5 and a smuggling compartment. Obviously cybernetic, but hides both a compartment and armor plating.",
    items: [
      { itemId: "cyberlimb-torso-obvious", qty: 1 },
      { itemId: "cyberlimb-acc-armor", qty: 1, rating: 5 },
      { itemId: "cyberlimb-acc-smuggling-compartment", qty: 1 },
    ],
  },
  {
    id: "pack-cyberarm-excellence",
    name: "Cyberarm: Excellence",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 60000,
    summary: "Cyberarm (synthetic) with Agility 6, Strength 6 - excellent attributes with a natural appearance.",
    items: [
      { itemId: "cyberlimb-arm-synthetic", qty: 1 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 2, rating: 6 },
    ],
  },
  {
    id: "pack-cyberarm-secret-handshake",
    name: "Cyberarm: Secret Handshake",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 41000,
    summary: "Cyberarm (synthetic) with Agility 4, Strength 2, a smuggling compartment, and a shock hand - appears perfectly natural.",
    items: [
      { itemId: "cyberlimb-arm-synthetic", qty: 1 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 1, rating: 4 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 1, rating: 2 },
      { itemId: "cyberlimb-acc-smuggling-compartment", qty: 1 },
    ],
  },
  {
    id: "pack-cyberarm-assassin",
    name: "Cyberarm: Assassin",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 50000,
    summary: "Cyberarm (synthetic) with Agility 6, Strength 3, and retractable spurs.",
    items: [
      { itemId: "cyberlimb-arm-synthetic", qty: 1 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 1, rating: 6 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 1, rating: 3 },
      { itemId: "implant-retractable-spurs", qty: 1 },
    ],
  },
  {
    id: "pack-cyberarm-firearm",
    name: "Cyberarm: Firearm",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 52650,
    summary:
      "Cyberarm (obvious) with Agility 6, Strength 4, and an implanted Ares Predator VI (external clip port, silencer), 5 spare variable ammunition clips, 100 caseless regular rounds, 100 caseless gel rounds. Book Essence Cost: 1 for just the arm - the implanted heavy pistol slot's own Essence cost (0.5) is catalogued separately here, so the computed total reads slightly higher than the book's stated 1.",
    items: [
      { itemId: "cyberlimb-arm-obvious", qty: 1 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 1, rating: 6 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 1, rating: 4 },
      { itemId: "implant-slot-heavy-pistol", qty: 1 },
      { itemId: "implant-weapon-external-clip-port", qty: 1 },
      { itemId: "implant-weapon-silencer", qty: 1 },
      { itemId: "ares-predator-vi", qty: 1 },
    ],
  },
  {
    id: "pack-cyberarm-heavily-armed",
    name: "Cyberarm: Heavily Armed",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 56000,
    summary: "Cyberarm (obvious) with Agility 6, Strength 5, and a gyromount that negates recoil penalties.",
    items: [
      { itemId: "cyberlimb-arm-obvious", qty: 1 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 1, rating: 6 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 1, rating: 5 },
      { itemId: "cyberlimb-acc-gyromount", qty: 1 },
    ],
  },
  {
    id: "pack-cyberleg-hollow-boot",
    name: "Cyberleg: Hollow Boot",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 51000,
    summary: "Cyberleg (synthetic) with Agility 4, armor 3, and a smuggling compartment. +3 Defense Rating and +1 box to Physical Condition Monitor.",
    items: [
      { itemId: "cyberlimb-leg-synthetic", qty: 1 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 1, rating: 4 },
      { itemId: "cyberlimb-acc-armor", qty: 1, rating: 3 },
      { itemId: "cyberlimb-acc-smuggling-compartment", qty: 1 },
    ],
  },
  {
    id: "pack-springheel-jack",
    name: "Springheel Jack",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 120000,
    summary: "Two obvious cyberlegs, each Agility 6, Strength 6, hydraulic jacks rating 6 - run fast, kick hard, jump far, +2 boxes to Physical Condition Monitor.",
    items: [
      { itemId: "cyberlimb-leg-obvious", qty: 2 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 2, rating: 6 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 2, rating: 6 },
      { itemId: "cyberlimb-acc-hydraulic-jacks", qty: 2, rating: 6 },
    ],
  },
  {
    id: "pack-springheel-juggernaut",
    name: "Springheel Juggernaut",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 180000,
    summary:
      "Two obvious cyberlegs, each Agility 6, Strength 6, armor 6, hydraulic jacks rating 6 - as capable as Springheel Jack plus +12 total Defense Rating.",
    items: [
      { itemId: "cyberlimb-leg-obvious", qty: 2 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 2, rating: 6 },
      { itemId: "cyberlimb-acc-attribute-increase", qty: 2, rating: 6 },
      { itemId: "cyberlimb-acc-armor", qty: 2, rating: 6 },
      { itemId: "cyberlimb-acc-hydraulic-jacks", qty: 2, rating: 6 },
    ],
  },

  // --- Cyberprogram Everything PACK (Companion p. 60) ---
  // Referenced by name inside most Hacker PACKs above, but also sold as its
  // own standalone PACK - built here since it's genuinely independent, not
  // nested. No individual "Agent" catalog entry exists (only generic
  // Cyberprogram, Basic), so it's referenced in bulk; the book notes the
  // Agent alone accounts for 9,000 of the 14,170 nuyen total, absorbed into
  // the bundle-adjustment line along with the other 17 named programs.
  {
    id: "pack-cyberprogram-everything",
    name: "Cyberprogram Everything PACK",
    category: "console-pack",
    subcategory: "Console PACKs",
    cost: 14170,
    summary:
      "Software: Agent (rating 6, accounts for 9,000 of the total price), Baby Monitor, Browse, Configurator, Edit, Encryption, Signal Scrubber, Toolbox, Armor, Biofeedback Filter, Blackout, Decryption, Defuse, Exploit, Fork, Lockdown, Overclock, Stealth, Trace.",
    items: [{ itemId: "software-cyberprogram-basic", qty: 17 }],
  },

  // --- Console PACKs (Companion p. 69) ---
  // Each RCC PACK bundles 5-6 generic cyberprograms and four autosofts on
  // top of the console itself - none of these carry Essence/Karma cost, so
  // they're referenced in bulk via the generic Cyberprogram/Autosoft
  // entries rather than one line per named program, with the full named
  // list kept in `summary` for reference.
  {
    id: "pack-backup-rcc",
    name: "Backup RCC PACK",
    category: "console-pack",
    subcategory: "Console PACKs",
    cost: 22240,
    summary:
      "Essy Motors Dronemaster RCC with cyberprograms (Encryption, Signal Scrubber, Toolbox, Virtual Machine) and four rating 3 autosofts (Clearsight, drone Maneuvering, drone Stealth, weapon Targeting). Runs up to 3 programs at once; slaves up to 9 drones. For hobbyists rather than serious riggers.",
    items: [
      { itemId: "rcc-essy-motors-dronemaster", qty: 1 },
      { itemId: "software-cyberprogram-basic", qty: 4 },
      { itemId: "software-autosoft", qty: 4, rating: 3 },
    ],
  },
  {
    id: "pack-basic-rcc",
    name: "Basic RCC PACK",
    category: "console-pack",
    subcategory: "Console PACKs",
    cost: 32360,
    summary:
      "Maersk Spider RCC with cyberprograms (Armor, Encryption, Signal Scrubber, Stealth, Toolbox, Virtual Machine) and four rating 4 autosofts (Clearsight, drone Maneuvering, drone Stealth, weapon Targeting). Runs up to 4 programs at once; slaves up to 12 drones.",
    items: [
      { itemId: "rcc-maersk-spider", qty: 1 },
      { itemId: "software-cyberprogram-basic", qty: 5 },
      { itemId: "software-autosoft", qty: 4, rating: 4 },
    ],
  },
  {
    id: "pack-professional-rcc",
    name: "Professional RCC PACK",
    category: "console-pack",
    subcategory: "Console PACKs",
    cost: 78360,
    summary:
      "Proteus Poseidon RCC with cyberprograms (Armor, Encryption, Signal Scrubber, Stealth, Toolbox, Virtual Machine) and four rating 5 autosofts (Clearsight, drone Maneuvering, drone Stealth, weapon Targeting). Runs up to 5 programs at once; slaves up to 15 drones. What most serious drone riggers would consider.",
    items: [
      { itemId: "rcc-proteus-poseidon", qty: 1 },
      { itemId: "software-cyberprogram-basic", qty: 5 },
      { itemId: "software-autosoft", qty: 4, rating: 5 },
    ],
  },
  {
    id: "pack-elite-rcc",
    name: "Elite RCC PACK",
    category: "console-pack",
    subcategory: "Console PACKs",
    cost: 107360,
    summary:
      "Ares Red Dog RCC with cyberprograms (Armor, Encryption, Signal Scrubber, Stealth, Toolbox, Virtual Machine) and four rating 6 autosofts (Clearsight, drone Maneuvering, drone Stealth, weapon Targeting). Runs up to 6 programs at once; slaves up to 18 drones. One of the best investments a drone rigger can make.",
    items: [
      { itemId: "rcc-ares-red-dog-series", qty: 1 },
      { itemId: "software-cyberprogram-basic", qty: 5 },
      { itemId: "software-autosoft", qty: 4, rating: 6 },
    ],
  },

  // --- Drone Autosoft PACKs (Companion pp. 70-71) ---
  // Autosofts cost their rating x 500 nuyen regardless of type (per the
  // book's own text) and carry no Essence/Karma cost, so each tier is
  // represented by the generic "Autosoft" entry at the stated rating and
  // qty (3 for Recon: Clearsight + Maneuvering + Stealth; 2 for Combat:
  // Maneuvering + Targeting) - the specific autosoft names are listed in
  // `summary`. Pilot Rating 1 (Recon) and Pilot Ratings 1-2 (Combat) are
  // explicitly "don't bother" per the book, not priced, so no entry exists
  // for them.
  {
    id: "pack-recon-autosofts-pilot-2",
    name: "Recon Autosofts (Pilot Rating 2)",
    category: "drone-autosoft-pack",
    subcategory: "Drone Autosoft PACKs",
    cost: 2000,
    summary: "Clearsight rating 2, drone-specific Stealth rating 2. For stealthy observation drones.",
    items: [{ itemId: "software-autosoft", qty: 2, rating: 2 }],
  },
  {
    id: "pack-recon-autosofts-pilot-3",
    name: "Recon Autosofts (Pilot Rating 3)",
    category: "drone-autosoft-pack",
    subcategory: "Drone Autosoft PACKs",
    cost: 4500,
    summary: "Clearsight rating 3, drone-specific Maneuvering 3, drone-specific Stealth 3.",
    items: [{ itemId: "software-autosoft", qty: 3, rating: 3 }],
  },
  {
    id: "pack-recon-autosofts-pilot-4",
    name: "Recon Autosofts (Pilot Rating 4)",
    category: "drone-autosoft-pack",
    subcategory: "Drone Autosoft PACKs",
    cost: 6000,
    summary: "Clearsight rating 4, drone-specific Maneuvering 4, drone-specific Stealth 4.",
    items: [{ itemId: "software-autosoft", qty: 3, rating: 4 }],
  },
  {
    id: "pack-recon-autosofts-pilot-5",
    name: "Recon Autosofts (Pilot Rating 5)",
    category: "drone-autosoft-pack",
    subcategory: "Drone Autosoft PACKs",
    cost: 7500,
    summary: "Clearsight rating 5, drone-specific Maneuvering 5, drone-specific Stealth 5.",
    items: [{ itemId: "software-autosoft", qty: 3, rating: 5 }],
  },
  {
    id: "pack-recon-autosofts-pilot-6",
    name: "Recon Autosofts (Pilot Rating 6)",
    category: "drone-autosoft-pack",
    subcategory: "Drone Autosoft PACKs",
    cost: 9000,
    summary: "Clearsight rating 6, drone-specific Maneuvering 6, drone-specific Stealth 6.",
    items: [{ itemId: "software-autosoft", qty: 3, rating: 6 }],
  },
  {
    id: "pack-combat-autosofts-pilot-3",
    name: "Combat Autosofts (Pilot Rating 3)",
    category: "drone-autosoft-pack",
    subcategory: "Drone Autosoft PACKs",
    cost: 3000,
    summary: "Drone-specific Maneuvering 3, weapon Targeting 3. Basic maneuvering/targeting for a combat support drone.",
    items: [{ itemId: "software-autosoft", qty: 2, rating: 3 }],
  },
  {
    id: "pack-combat-autosofts-pilot-4",
    name: "Combat Autosofts (Pilot Rating 4)",
    category: "drone-autosoft-pack",
    subcategory: "Drone Autosoft PACKs",
    cost: 4000,
    summary: "Drone-specific Maneuvering 4, weapon Targeting 4.",
    items: [{ itemId: "software-autosoft", qty: 2, rating: 4 }],
  },
  {
    id: "pack-combat-autosofts-pilot-5",
    name: "Combat Autosofts (Pilot Rating 5)",
    category: "drone-autosoft-pack",
    subcategory: "Drone Autosoft PACKs",
    cost: 5000,
    summary: "Drone-specific Maneuvering 5, weapon Targeting 5.",
    items: [{ itemId: "software-autosoft", qty: 2, rating: 5 }],
  },
  {
    id: "pack-combat-autosofts-pilot-6",
    name: "Combat Autosofts (Pilot Rating 6)",
    category: "drone-autosoft-pack",
    subcategory: "Drone Autosoft PACKs",
    cost: 6000,
    summary: "Drone-specific Maneuvering 6, weapon Targeting 6.",
    items: [{ itemId: "software-autosoft", qty: 2, rating: 6 }],
  },

  // --- Complete Character PACKs (Companion pp. 49-55) ---
  // Each is a full-nuyen pre-built character kit. 14 of 15 nest the
  // Shadowrunner Starter PACK inside themselves ("Included PACK") -
  // includesPackId resolves that one level deep (explodePackToGearLines,
  // derivePacks.ts). Only augmentations (for Essence accuracy), foci (for
  // Karma-bonding accuracy), lifestyle grants, and a representative
  // vehicle/drone/RCC/cyberdeck anchor are itemized; the rest of each
  // PACK's large item list (weapons, armor, accessories, extra fake
  // licenses) is folded into the automatic bundle-adjustment line, same
  // simplification precedent the category PACKs above already established.
  // "Used" grade cyberware/bioware (Implant Grades still aren't modeled -
  // see augmentations.ts's header) is approximated with the standard-grade
  // catalog entry in every PACK that specifies it; each affected PACK's
  // summary states the book's own printed Essence Cost as the authoritative
  // cross-check figure.
  {
    id: "pack-starter-shadowrunner",
    name: "Shadowrunner Starter PACK",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 25000,
    summary:
      "The foundation nearly every other Complete Character PACK below builds on (\"Included PACK\"). Fake SIN (rating 4), two more fake licenses (rating 4, player's choice of covered activity), Hermes Ikon + Meta Link commlinks, 10 stealth tags, bug scanner, tag eraser, area jammer (rating 6), micro-transceiver, 10 plastic straps, miniwelder + 2 spare fuel canisters, gas mask, respirator (rating 6), climbing gear, survival kit, flashlight, gecko tape gloves, grapple gun (100m rope), biomonitor, 2 stim patches (rating 6), 2 trauma patches, trid projector, mapsoft (local area). One month Low lifestyle (the book offers 2,000¥ toward another lifestyle instead - swap the Low lifestyle line out afterward if you'd rather have the nuyen).",
    items: [
      { itemId: "id-fake-sin", qty: 1, rating: 4 },
      { itemId: "id-fake-license", qty: 2, rating: 4, notes: "Player's choice of covered activity/item." },
      { itemId: "commlink-hermes-ikon", qty: 1 },
      { itemId: "commlink-meta-link", qty: 1 },
    ],
    lifestyle: { itemId: "lifestyle-low", months: 1 },
  },
  {
    id: "pack-dirt-poor",
    name: "Dirt Poor",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 8000,
    summary:
      "The only Complete Character PACK that does NOT include the Shadowrunner Starter PACK - a bare-minimum-resources start. Defiance Super-Shock Taser (hidden arm slide, 10 taser darts), shock gloves, armor vest (chemical protection 1, cold resistance 1, electricity resistance 2, fire resistance 2), contacts (rating 3, flare compensation, image link, choose low-light or thermographic vision), micro-transceiver, Sony Emperor commlink. One month Low lifestyle.",
    items: [],
    lifestyle: { itemId: "lifestyle-low", months: 1 },
  },
  {
    id: "pack-full-magician",
    name: "Full Magician",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 50000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. 4 throwing knives, 2 stun/2 fragmentation/2 thermal smoke grenades, armor jacket + helmet, 10 stim patches (rating 6), mage-sight goggles, periscope, optical binoculars, contacts (choose low-light or thermographic vision), plus 2 more fake licenses (Magician, Stun Grenades). Lifestyle upgraded from the Starter PACK's Low to one month Medium.",
    items: [
      { itemId: "magical-lodge-materials", qty: 1, rating: 6 },
      { itemId: "reagents", qty: 100 },
      { itemId: "vehicle-chrysler-nissan-jackrabbit", qty: 1, notes: "w/ rating 2 maneuvering autosoft." },
    ],
    lifestyle: { itemId: "lifestyle-middle", months: 1 },
  },
  {
    id: "pack-close-combat-adept",
    name: "Close Combat Adept",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 50000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. Combat axe, katana, polearm, telescoping staff, combat knife, 4 throwing knives, armor vest + helmet, plus 2 more fake licenses (Magician, Foci). Lifestyle stays the Starter PACK's Low.",
    items: [
      {
        itemId: "focus-weapon",
        qty: 1,
        rating: 3,
        notes: "Enchants one owned Close Combat weapon (player's choice); pay 9 Karma to bond and unlock its effect.",
      },
    ],
  },
  {
    id: "pack-face",
    name: "Face",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 50000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. Shock gloves, light collapsible crossbow (5 Narcoject bolts), 2 stun/2 fragmentation/2 thermal smoke grenades, Flash-pak, Armanté suit + Actioneer business clothes + lined coat (all electrochromic), cellular glove molder, keycard copier, lockpick set, disguise kit, white noise generator, contacts/earbuds/glasses, empty certified credsticks (3 standard, 1 silver, 1 gold), plus 2 more fake licenses (Locksmith, Stun Grenades). Lifestyle stays the Starter PACK's Low.",
    items: [],
  },
  {
    id: "pack-gunslinger-adept",
    name: "Gunslinger Adept",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 50000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. No augmentations, by design (\"none of those Magic-reducing augmentations\"). Ruger Super Warhawk, Ares Predator VI, Ruger Redhawk, Ares Light Fire 75, Mossberg CMDT, Cavalier Arms Crockett EBR, lined coat, contacts/earbuds/glasses (built-in smartlink), plus 2 more fake licenses (Pistols, concealed carry). Lifestyle stays the Starter PACK's Low.",
    items: [],
  },
  {
    id: "pack-cybered-covert-operative",
    name: "Cybered Covert Operative",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 150000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. Book's printed Essence Cost: 3.63 (computed total below is close but not exact - the cyberarm's shock limb/retractable spur accessories aren't separately modeled). Agility 6 for the cyberarm, Reaction +2, +2d6 Initiative dice (two more Minor Actions). 4 throwing stars, light collapsible crossbow (6 Narcoject bolts), telescoping staff, Chameleon suit, lined coat, contacts/earbuds, lockpick set, cellular glove molder, keycard copier, sequencer, glue sprayer + solvent, 30m myomeric rope, stealth grapple gun, plus 2 more fake licenses (Augmentations, bodyguard). Lifestyle stays the Starter PACK's Low.",
    items: [
      {
        itemId: "cyberlimb-arm-synthetic",
        qty: 1,
        notes: "Agility 6, shock limb, retractable spur (accessories folded into the adjustment line).",
      },
      { itemId: "skin-pocket", qty: 1, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "wired-reflexes-2", qty: 1, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "voice-modulator", qty: 1, notes: "Rating 3 in the book, flat Essence cost regardless of rating; used grade not modeled." },
    ],
  },
  {
    id: "pack-decker",
    name: "Decker",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 275000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. Book's printed Essence Cost: 3.4 (computed total below reads a bit lower - the cyberjack is \"used\" grade in the book, not separately modeled). Full 18-program Basic + Hacking software suite plus Agent (rating 6), shock gloves, Ares Predator VI, lined coat + helmet, white noise generator, data tap, Electronics toolkit, directional jammer, contacts/glasses, medkit, plus 2 more fake licenses (Augmentations, pistols) and 1,000¥ cash left over. Lifestyle upgraded from the Starter PACK's Low to one month Medium.",
    items: [
      { itemId: "cyberjack-rating-6", qty: 1, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "datajack", qty: 1 },
      { itemId: "cyberdeck-renraku-kitsune", qty: 1 },
      { itemId: "vehicle-hyundai-shin-hyung", qty: 1 },
    ],
    lifestyle: { itemId: "lifestyle-middle", months: 1 },
  },
  {
    id: "pack-full-conversion-cyborg",
    name: "Full Conversion Cyborg",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 450000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. Book's printed Essence Cost: 5.9 (computed total below reads noticeably higher - none of these are \"alphaware\" grade in this catalog, and this app doesn't model the book's multi-cyberlimb Essence discount; the book figure is authoritative). Defense Rating +15, Agility 6, Strength 4, six extra boxes to the Physical Condition Monitor. Ares Viper Slivergun, Ruger Super Warhawk, AK-97, stun baton, katana, full body armor + armor jacket, 20 doses of cram, 4 doses of jazz, Flash-pak, plus 2 more fake licenses (Cyber implant weapons, full body armor). Lifestyle stays the Starter PACK's Low.",
    items: [
      { itemId: "cyberlimb-skull-obvious", qty: 1, notes: "Armor 4." },
      { itemId: "cyberlimb-torso-obvious", qty: 1, notes: "Armor 5, smuggling compartment." },
      { itemId: "cyberlimb-arm-obvious", qty: 2, notes: "One w/ gyromount, one w/ an integrated Ares Predator VI (external clip port, silencer)." },
      { itemId: "cyberlimb-leg-obvious", qty: 2, notes: "Armor 3, holster, hydraulic jacks 6." },
      { itemId: "cybereyes-rating-4", qty: 1 },
      { itemId: "cyberears-rating-1", qty: 1, notes: "Approximates the book's \"basic system\" cyberears (w/ damper)." },
    ],
  },
  {
    id: "pack-street-samurai",
    name: "Street Samurai",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 275000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. Book's printed Essence Cost: 5.9 (computed total below is close but not exact - \"used\" grade on wired reflexes isn't separately modeled). Body +2, Agility +2, Strength +2, +4 Reaction, +2 DR, +2 Unarmed AR, +2d6 Initiative dice (two more minor actions). Katana, stun baton, Ruger Redhawk, Ares Predator VI, Ingram Smartgun XI, Mossberg CMDT, Ares Alpha, armor jacket + helmet, Flash-pak, plus 2 more fake licenses (Augmentations, pistols, concealed carry, submachineguns - two of the four come from the Starter PACK). Lifestyle stays the Starter PACK's Low.",
    items: [
      { itemId: "wired-reflexes-2", qty: 1, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "reaction-enhancers", qty: 1, rating: 2 },
      { itemId: "bone-lacing-aluminum", qty: 1 },
      { itemId: "muscle-replacement", qty: 1, rating: 2 },
      { itemId: "cybereyes-rating-4", qty: 1 },
      { itemId: "cyberears-rating-3", qty: 1 },
    ],
  },
  {
    id: "pack-vat-job-combat-specialist",
    name: "Vat Job Bioware-Augmented Combat Specialist",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 275000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. Book's printed Essence Cost: 5.17 (computed total below is close but not exact - \"used\" grade isn't separately modeled). All-bioware build, invisible to a cyberware scan. Body +4 (damage soak only), Agility +2, Strength +2, Reaction +2, Unarmed AR +3, +2d6 Initiative dice (two more minor actions) - the adrenaline pump's bonus is a 2d6-round activated boost, not always-on. Monofilament whip, Colt Manhunter, FN P93 Praetor, lined coat + helmet, contacts, 2 flash-paks, grenades (smoke/thermal smoke/stun), 10 stim patches, plus 2 more fake licenses (Pistols, concealed carry). Lifestyle stays the Starter PACK's Low.",
    items: [
      { itemId: "adrenaline-pump", qty: 1, rating: 2, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "bone-density-augmentation", qty: 1, rating: 4, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "muscle-augmentation", qty: 1, rating: 2, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "muscle-toner", qty: 1, rating: 2, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "synaptic-booster", qty: 1, rating: 2, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "skin-pocket", qty: 1, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "reflex-recorder", qty: 1, notes: "Exotic Weapons; used grade in the book, standard grade catalog price/Essence used instead." },
    ],
  },
  {
    id: "pack-weapons-specialist",
    name: "Weapons Specialist",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 275000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. Book's printed Essence Cost: 3.95 (computed total below is close but not exact - \"used\" grade isn't separately modeled). Agility +4, Reaction +2, +2d6 Initiative dice, +1 augmented rank in Athletics/Close Combat/Exotic Weapons/Firearms. A huge weapon collection (forearm snap blades, combat knife/axe, polearm, sap, stun baton, throwing knives, taser, Walther Palm Pistol, Ruger Redhawk/Super Warhawk, HK-227, Remington Roomsweeper, Ranger Arms SM-5, RPK HMG, ArmTech MGL-6) plus explosives (conventional/plastic/foam packages, armorer + demolitions toolkits), lined coat/helmet/full body armor/ballistic shield, plus 2 more fake licenses (Augmentations, concealed carry, pistols, shotguns, submachine guns - two of the five come from the Starter PACK). Lifestyle upgraded from the Starter PACK's Low to one month Medium.",
    items: [
      { itemId: "cyberears-rating-1", qty: 1, notes: "Approximates the book's \"basic system\" cyberears (w/ damper)." },
      { itemId: "cybereyes-rating-3", qty: 1 },
      { itemId: "wired-reflexes-2", qty: 1, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "muscle-toner", qty: 1, rating: 4, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "reflex-recorder", qty: 4, notes: "Athletics, Close Combat, Exotic Weapons, Firearms (one each, all used grade in the book)." },
    ],
    lifestyle: { itemId: "lifestyle-middle", months: 1 },
  },
  {
    id: "pack-max-hardware-decker",
    name: "Max Hardware Decker",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 450000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. Book's printed Essence Cost: 5 (computed total below is close but not exact - the cyberjack is \"used\" grade, and the cyberdeck is installed as headware rather than carried, neither separately modeled). Logic +3. Full 18-program Basic + Hacking software suite plus Agent (rating 6), Ruger Redhawk, Ares Viper Slivergun, armor vest, data tap, earbuds, Electronics toolkit, MCT Gnat drone (rating 2 Clearsight autosoft), white noise generator, plus 2 more fake licenses (Augmentations, pistols). Lifestyle stays the Starter PACK's Low.",
    items: [
      { itemId: "cerebral-booster", qty: 1, rating: 3 },
      { itemId: "cyberjack-rating-6", qty: 1, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "cyberdeck-shiawase-cyber-6", qty: 1, notes: "Installed as headware in the book - modeled as a normal carried cyberdeck." },
      { itemId: "datajack", qty: 1 },
      { itemId: "cybereyes-rating-4", qty: 1 },
    ],
  },
  {
    id: "pack-transport-rigger",
    name: "Transport Rigger",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 450000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. Logic +2, +3 dice to Piloting tests. Ares Predator VI, armor jacket + helmet, automotive toolkit/shop, plus 2 more fake licenses (Pistols, concealed carry). Lifestyle upgraded from the Starter PACK's Low to one month Medium. Vehicle/drone weapon-mount and road-warfare-kit modifications (rigger adaptation, gun ports, spike strips, etc.) aren't itemized individually - see the deferred Vehicle Upgrade PACKs for that catalog.",
    items: [
      { itemId: "cerebral-booster", qty: 1, rating: 2 },
      { itemId: "control-rig", qty: 1, rating: 3, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "cybereyes-rating-3", qty: 1 },
      { itemId: "rcc-maersk-spider", qty: 1, notes: "w/ cyberprograms Armor/Encryption/Signal Scrubber/Stealth/Toolbox/Virtual Machine, rating 4 autosofts." },
      { itemId: "vehicle-ares-roadmaster", qty: 1, notes: "Rigger-adapted, RPK HMG pop-up heavy weapon mount, full road-warfare kit." },
      { itemId: "vehicle-ford-americar", qty: 1, notes: "Rigger-adapted, Panther XXL + FN HAR weapon mounts, full road-warfare kit." },
      { itemId: "drone-mct-hornet", qty: 4, notes: "Stinger armed with Narcoject." },
      { itemId: "drone-gm-nissan-flip-flop", qty: 1 },
    ],
    lifestyle: { itemId: "lifestyle-middle", months: 1 },
  },
  {
    id: "pack-drone-rigger",
    name: "Drone Rigger",
    category: "complete-character-pack",
    subcategory: "Complete Character PACKs",
    cost: 450000,
    includesPackId: "pack-starter-shadowrunner",
    summary:
      "Includes the Shadowrunner Starter PACK. 2 Ares Crusader II pistols, helmet + lined coat, automotive/aircraft toolkits and shops, armorer kit + shop, plus 2 more fake licenses (RCC, augmentations). Lifestyle upgraded from the Starter PACK's Low to one month Medium. Drone weapon-mount loadouts aren't itemized individually - see the deferred Vehicle Upgrade PACKs for that catalog.",
    items: [
      { itemId: "cerebral-booster", qty: 1, rating: 2 },
      { itemId: "control-rig", qty: 1, rating: 2, notes: "Used grade in the book; standard grade catalog price/Essence used instead." },
      { itemId: "cybereyes-rating-3", qty: 1 },
      { itemId: "rcc-proteus-poseidon", qty: 1, notes: "w/ cyberprograms Armor/Encryption/Signal Scrubber/Stealth/Toolbox/Virtual Machine, rating 5 autosofts." },
      { itemId: "vehicle-gmc-bulldog-step-van", qty: 1, notes: "Rigger-adapted, RPK HMG pop-up turret heavy weapon mount." },
      { itemId: "drone-steel-lynx-combat", qty: 1, notes: "Two heavy weapon mounts: RPK HMG + ArmTech MGL-12." },
      { itemId: "drone-mct-nissan-roto-drone", qty: 4, notes: "2 w/ ArmTech MGL-12 heavy mount, 2 w/ AK-97 standard mount." },
      { itemId: "drone-horizon-flying-eye", qty: 6, notes: "3 w/ flash-paks, 3 w/ smoke grenades." },
      { itemId: "drone-gmc-micromachine", qty: 1 },
    ],
    lifestyle: { itemId: "lifestyle-middle", months: 1 },
  },
  {
    id: "pack-augmented-for-firearms",
    name: "Augmented for Firearms PACK",
    category: "augmentation-pack",
    subcategory: "Augmentation PACKs",
    cost: 25000,
    summary:
      "Not a Complete Character PACK (no included Starter PACK, no lifestyle) - a standalone starting point for a gun-focused mundane or gunslinger adept willing to spend a little Essence. Book's printed Essence Cost: 0.41 (computed total below is close but not exact - \"used\" grade on the reflex recorder isn't separately modeled). Ares Predator VI, Ares Light Fire 75, Streetline Special.",
    items: [
      { itemId: "cybereyes-rating-3", qty: 1, notes: "Smartlink-ready, built-in magnification." },
      { itemId: "reflex-recorder", qty: 1, notes: "Firearms; used grade in the book, standard grade catalog price/Essence used instead." },
    ],
  },
];
