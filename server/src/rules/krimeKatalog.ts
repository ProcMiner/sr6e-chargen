// Gear catalog, Krime Katalog sourcebook chunk - the "Krime" (weapons/gear)
// half of that book only; the "Krime Motors" vehicle lineup (Wageslave PMV,
// Bazoo/Big Bazoo, SV-2 Crashtest, Prowler, DETruck, Dix, Barco De Pesca,
// Euskaldunak Tankette) is a separate, deliberately deferred chunk - ask
// before adding it. Transcribed from Krime_Katalog_noimg.pdf's SR6 stat
// blocks (each item prints both SR5 and SR6 numbers; only SR6 is used
// here, matching this app's edition throughout). Flavor text is paraphrased
// in our own words, same convention as gear.ts/qualities.ts.
//
// Known gaps, flagged rather than guessed at:
// - Krime Ripper (anti-air turret: Pilot 3, Sensor Array DR3, twin
//   unnamed "Krime Wave" machine guns, deploy/undeploy mechanics) and Krime
//   Runner (a basic distraction drone) are both full drone stat blocks
//   (Handling/Speed/Accel/Body/Armor/Pilot/Sensor/Seats), not weapon-shaped
//   data this file's schema fits - same boundary as drones.ts being its own
//   catalog. Deferred.
// - Krime Calliope (vehicle-mounted 10-shot rocket pod) and Krime Carpet
//   (vehicle/drone weapon-mount grenade dispenser) both require a vehicle's
//   Heavy Weapon Mount and use the Gunnery skill - not man-portable, unlike
//   every other item below. Deferred alongside the vehicle chunk rather
//   than shoehorned into the personal Launchers subcategory.
// - "Krime Happiness" (an assault rifle) and "Krime Wave" (a machine gun)
//   are both named only as another item's bundled/coaxial armament
//   (Euskaldunak Tankette, Krime Ripper respectively) - the book never
//   gives either its own stat block, so neither is catalogued here.
// - The three ammo types the book doesn't explicitly restrict to one
//   weapon class (Power Rounds, Laser Bullets, Splash Self-Defense) price
//   as a flat multiplier (x1.5/x2/x2) against whatever base ammo cost a
//   player picks - this catalog's flat-cost-per-entry model can't express
//   "multiplier against any class," so each is priced here against one
//   representative base class (noted in its own summary) at that same
//   multiplier; recompute by hand for a different weapon class. Same
//   unresolved-multiplier shape as gear.ts's own ammo-type-modifier gap
//   (APDS/Explosive/Flechette/Gel/Stick-n-Shock), not a new problem
//   introduced here.

import type { GearCatalogEntry } from "./gear.js";

export const krimeKatalogGear: GearCatalogEntry[] = [
  // --- Weapons: Hold-outs ---
  {
    id: "krime-vester",
    name: "Krime Vester",
    category: "weapon",
    subcategory: "Hold-outs",
    cost: 170,
    availability: "3(L)",
    summary: "An over-sized-grip derringer built for metahumans with large hands; comes with Metahuman Adaptation.",
    stats: { damage: "3P", modes: "SS", attackRatings: "6/6/—/—/—", ammo: "2(b)" },
  },

  // --- Weapons: Heavy Pistols ---
  {
    id: "krime-heater",
    name: "Krime Heater",
    category: "weapon",
    subcategory: "Heavy Pistols",
    cost: 175,
    availability: "4(L)",
    summary: "A deliberately oversized, easy-to-strip heavy pistol built for large hands; comes with Metahuman Adaptation.",
    stats: { damage: "4P", modes: "SS/SA", attackRatings: "6/8/6/—/—", ammo: "8(c)" },
  },
  {
    id: "krime-varmint",
    name: "Krime Varmint Stocked Pistol",
    category: "weapon",
    subcategory: "Heavy Pistols",
    cost: 300,
    availability: "4(L)",
    summary:
      "A long-barreled heavy pistol with a detachable shoulder-brace/holster (holds two spare clips) and a built-in cleaning kit; uses the Pistols skill despite using SMG concealment/ranges once stocked. Comes with the stock/holster, two spare clips, and Metahuman Adaptation.",
    stats: { damage: "4P", modes: "SS/SA", attackRatings: "7/9/7/—/—", ammo: "8(c)" },
  },

  // --- Weapons: Submachine Guns ---
  {
    id: "krime-chatter",
    name: "Krime Chatter",
    category: "weapon",
    subcategory: "Submachine Guns",
    cost: 180,
    availability: "5(I)",
    summary:
      "A compact, low-recoil double-stroke gas-piston SMG with an optional sixty-round drum. Comes with Metahuman Adaptation. While carrying any Krime Drums, the holder can't use Edge for sneaking due to the noise.",
    stats: { damage: "3P", modes: "FA", attackRatings: "8/8/6/—/—", ammo: "20(c)/60(d)" },
  },
  {
    id: "krime-tradition",
    name: "Krime Tradition",
    category: "weapon",
    subcategory: "Submachine Guns",
    cost: 500,
    availability: "7(I)",
    summary:
      "A modernized Tommy Gun with a seventy-five-round drum option, foregrip, gas-vent system, and a smartgun-ready stock slot for a commlink. Comes with the foregrip, gas-vent system, and Metahuman Adaptation. Concealability threshold 1 with the thirty-round clip, 0 with the seventy-five-round drum; while carrying any Krime Drums, the holder can't use Edge for sneaking due to the noise.",
    stats: { damage: "4P", modes: "SA/FA", attackRatings: "9/9/6/—/—", ammo: "30(c)/75(d)" },
  },

  // --- Weapons: Rifles ---
  {
    id: "krime-saint-nicholas-carbine",
    name: "Krime Saint Nicholas Carbine",
    category: "weapon",
    subcategory: "Rifles",
    cost: 500,
    availability: "3(I)",
    summary:
      "A slimline carbine firing an assault-rifle round in semi-auto from a small platform, built for easy concealed carry. Comes with a sling and Metahuman Adaptation. +2 Concealability threshold with the seven-round clip.",
    stats: { damage: "5P", modes: "SA", attackRatings: "8/6/4/—/—", ammo: "7(c)/21(c)" },
  },
  {
    id: "krime-akm-97-carbine",
    name: "Krime AKM-97 Carbine",
    category: "weapon",
    subcategory: "Rifles",
    cost: 500,
    availability: "3(L)",
    summary: "A modernized AK-97 variant with ambidextrous controls and improved ergonomics; this carbine model has a folding stock.",
    stats: { damage: "4P", modes: "SA/BF/FA", attackRatings: "8/8/4/1/—", ammo: "38(c)" },
  },
  {
    id: "krime-akm-97-assault-rifle",
    name: "Krime AKM-97 Assault Rifle",
    category: "weapon",
    subcategory: "Rifles",
    cost: 3000,
    availability: "3(L)",
    summary: "The full-length AKM-97 with a shock-pad stock; all AK-97/AKM-97 magazines and aftermarket mods are compatible.",
    stats: { damage: "5P", modes: "SA/BF/FA", attackRatings: "4/11/9/7/1", ammo: "38(c)" },
  },
  {
    id: "krime-ditch-combination-gun",
    name: "Krime Ditch Combination Gun",
    category: "weapon",
    subcategory: "Rifles",
    cost: 700,
    availability: "3(L)",
    summary:
      "An over-under break-open survival gun with an assault-rifle upper and a smoothbore-shotgun lower barrel, able to chamber both cased and caseless rounds; folds in half for storage. Uses the Longarms specialization for both barrels. Comes with Metahuman Adaptation. Concealability threshold 2 folded, 1 extended.",
    stats: {
      damage: "4P (rifle barrel)",
      modes: "SS",
      attackRatings: "6/8/6/4/1",
      ammo: "1(b)",
      shotgunMode: "SS, DV 5P, AR 7/5/1/—/—, ammo 1(b)",
    },
  },
  {
    id: "krime-junior-carbine",
    name: "Krime Junior Carbine",
    category: "weapon",
    subcategory: "Rifles",
    cost: 1000,
    availability: "2(L)",
    summary:
      "A light-caliber, low-recoil rifle marketed for youth training, with a built-in Meta Link commlink (DR 1) preloaded with a Longarms tutorsoft. Uses Light Pistol ammunition. Comes with the integral commlink, tutorsoft, and Metahuman Adaptation.",
    stats: { damage: "3P", modes: "SA", attackRatings: "8/10/6/—/—", ammo: "10(c)" },
  },
  {
    id: "krime-soldier",
    name: "Krime Soldier",
    category: "weapon",
    subcategory: "Rifles",
    cost: 3500,
    availability: "7(I)",
    summary:
      "A proper-sized assault rifle with a bundled underbarrel grenade launcher (no separate cost). Uses sniper rifle ammunition and the Longarms specialization; the grenade launcher uses minigrenades and the Heavy Weapons specialization. Comes with Metahuman Adaptation.",
    stats: {
      damage: "5P",
      modes: "SA/BF",
      attackRatings: "1/7/6/3/1",
      ammo: "21(c)",
      grenadeLauncher: "SS, DV as loaded grenade, AR 4/10/6/2/—, ammo 4(m)",
    },
  },

  // --- Weapons: Machine Guns/Assault Cannons ---
  {
    id: "krime-kar-97-h",
    name: "Krime KAR-97-H",
    category: "weapon",
    subcategory: "Machine Guns",
    cost: 3000,
    availability: "5(I)",
    summary:
      "A longer/heavier-barreled, bipod-equipped AKM-97 derivative that also accepts a custom 114-round drum. Comes with the bipod and Metahuman Adaptation. While carrying any Krime Drums, the holder can't use Edge for sneaking due to the noise.",
    stats: { damage: "5P", modes: "FA", attackRatings: "4/11/10/8/2", ammo: "38(c)/114(d)" },
  },
  {
    id: "krime-monster",
    name: "Krime Monster",
    category: "weapon",
    subcategory: "Machine Guns",
    cost: 1500,
    availability: "9(I)",
    summary: "A 15mm anti-materiel heavy machine gun, usable from a tripod or vehicle mount. Comes with Metahuman Adaptation.",
    stats: { damage: "6P", modes: "BF", attackRatings: "—/4/4/4/1", ammo: "100(belt)" },
  },
  {
    id: "krime-confederate",
    name: "Krime Confederate",
    category: "weapon",
    subcategory: "Machine Guns",
    cost: 3500,
    availability: "10(I)",
    summary: "A double-barreled, break-open assault cannon. Comes with Metahuman Adaptation.",
    stats: { damage: "8P", modes: "SS", attackRatings: "1/6/6/3/1", ammo: "2(b)" },
  },

  // --- Weapons: Special Weapons (Exotic) ---
  {
    id: "krime-t-shirt-cannon",
    name: "Krime T-Shirt Cannon",
    category: "weapon",
    subcategory: "Special Weapons",
    cost: 500,
    availability: "4",
    summary:
      "A non-lethal, compressed-air-powered novelty launcher built on the Krime Cannon's frame, used to lob t-shirts (or similarly sized soft payloads) into a crowd. Deals essentially no damage. Uses the Exotic Ranged Weapon skill. Comes with Metahuman Adaptation.",
    stats: { damage: "0S", modes: "SS", attackRatings: "8/11/6/2/1", ammo: "5(m)" },
  },

  // --- Weapons: Launchers ---
  {
    id: "krime-escalation",
    name: "Krime Escalation",
    category: "weapon",
    subcategory: "Launchers",
    cost: 2500,
    availability: "5(I)",
    summary:
      "A reusable single-shot rocket launcher (an updated RPG-7 clone), light enough for a Real-Sized Soldier to carry spare rockets. Uses the Exotic Weapons skill. Comes with an imaging scope, a Matrix signal scanner (displays the Matrix signal strength of whatever's aimed at), and Metahuman Adaptation, all bundled at no extra cost.",
    stats: { damage: "As missile", ammoType: "Missile", modes: "SS", attackRatings: "—/4/10/9/6", ammo: "1(ml)" },
  },

  // --- Weapon Accessories ---
  {
    id: "krime-dual-mode-external-smartgun-link",
    name: "Krime's Dual-Mode External Smartgun Link",
    category: "weapon",
    subcategory: "Weapon Accessories",
    cost: 500,
    availability: "2(L)",
    summary:
      "Functions as either a laser sight or a smartgun system, selected via a physical switch (so a decker can't just brick the smartgun with the safety on). Device Rating 1.",
    stats: { mount: "Top or Underbarrel", deviceRating: "1" },
  },
  {
    id: "krime-offline-support-solutions",
    name: "Krime's Offline Support Solutions",
    category: "weapon",
    subcategory: "Weapon Accessories",
    cost: 25,
    availability: "—",
    summary:
      "A hardcopy manual bundle (plus a bumper sticker, smiley button, and lubricant) for anyone without reliable Matrix access. Flavor/roleplay item - the book gives it no mechanical effect.",
  },
  {
    id: "krime-loudener",
    name: "Krime Loudener",
    category: "weapon",
    subcategory: "Weapon Accessories",
    cost: 250,
    availability: "—",
    summary:
      "The opposite of a silencer: increases a firearm's muzzle flare and report by one level (Light Pistols sound like Heavy Pistols, Rifles like Shotguns, etc.), and unlike a silencer works on revolvers and shotguns too. Also functions as a muzzle brake.",
    stats: { mount: "Barrel", recoilCompensation: "+2" },
  },
  {
    id: "krime-explosive-securing-tripod",
    name: "Krime Explosive Securing Tripod",
    category: "weapon",
    subcategory: "Weapon Accessories",
    cost: 1000,
    availability: "6(L)",
    summary:
      "A tripod that fires pitons into the ground to anchor itself; still works as a normal tripod if the pitons aren't deployed, and quick-release clamps let it disengage instantly.",
    stats: { mount: "Underbarrel", recoilCompensation: "+6 (tripod only) / +10 (pitons deployed)" },
  },
  {
    id: "krime-explosive-securing-tripod-pitons",
    name: "Krime Explosive Securing Tripod Pitons (Replacement Set)",
    category: "weapon",
    subcategory: "Weapon Accessories",
    cost: 300,
    availability: "6(L)",
    summary: "A replacement set of pitons for the Krime Explosive Securing Tripod, consumed when fired into the ground.",
  },
  {
    id: "krime-keeper",
    name: "Krime Keeper",
    category: "weapon",
    subcategory: "Weapon Accessories",
    cost: 50,
    availability: "—",
    summary:
      "A universal weapon cleaning kit (works on any caliber/barrel length) with non-oil-based solutions and a firearms-maintenance tutorsoft. Flavor/roleplay item - the book gives it no mechanical effect.",
  },

  // --- Ammunition ---
  {
    id: "krime-power-rounds",
    name: "Krime Power Rounds (10 rounds, Heavy Pistol/SMG base)",
    category: "weapon",
    subcategory: "Ammunition",
    cost: 15,
    availability: "3(L)",
    summary:
      "Increases muzzle flare and acoustic report by one level (no AR/DV change). Prices at 1.5x a weapon class's base Regular-ammo cost - shown here against the Heavy Pistol/SMG base (10¥); recompute at the same 1.5x multiplier for other classes.",
  },
  {
    id: "krime-penetrators-buckshot",
    name: "Krime Penetrators Buckshot Shells (10 rounds)",
    category: "weapon",
    subcategory: "Ammunition",
    cost: 45,
    availability: "8(I)",
    summary: "Chromed tungsten shotgun buckshot built to punch through armor plate. Shotgun ammo only (3x the base Shotgun ammo cost of 15¥).",
    stats: { arModifier: "+2", dvModifier: "+1" },
  },
  {
    id: "krime-crackle-heat-slugs",
    name: "Krime Crackle Fin-Stabilized HEAT Slugs (10 rounds)",
    category: "weapon",
    subcategory: "Ammunition",
    cost: 75,
    availability: "9(I)",
    summary:
      "A miniaturized shaped-charge HEAT round, shotgun slugs only (5x the base Shotgun ammo cost of 15¥). A glitch detonates the chambered round in the user's hand for its own damage; a critical glitch chainfires every round in the weapon for their combined damage. Either way, the weapon is destroyed.",
    stats: { arModifier: "+3", dvModifier: "+3" },
  },
  {
    id: "krime-laser-bullets",
    name: "Krime Laser Bullets (10 rounds, Rifle base)",
    category: "weapon",
    subcategory: "Ammunition",
    cost: 40,
    availability: "3(L)",
    summary:
      "All-tracer loads that streak like laser fire from automatic weapons; +2 Attack Rating in Burst Fire/Full Auto modes only (cumulative with a laser sight, not a smartgun system). Prices at 2x a weapon class's base Regular-ammo cost - shown here against the Rifle base (20¥); recompute at the same 2x multiplier for other automatic-capable classes.",
    stats: { arModifier: "+2 (BF/FA modes only)" },
  },
  {
    id: "krime-punisher-assault-cannon-rounds",
    name: "Krime Punisher Assault Cannon Rounds (10 rounds)",
    category: "weapon",
    subcategory: "Ammunition",
    cost: 38,
    availability: "4(L)",
    summary:
      "Cheap steel-jacketed lead in place of exploding assault cannon rounds. Assault Cannon ammo only (0.75x the base Assault Cannon ammo cost of 50¥, rounded up from 37.5¥).",
    stats: { arModifier: "-2", dvModifier: "-2" },
  },
  {
    id: "krime-splash-self-defense",
    name: "Krime Splash Self-Defense Ammunition (10 rounds, Heavy Pistol/SMG base)",
    category: "weapon",
    subcategory: "Ammunition",
    cost: 20,
    availability: "2(L)",
    summary:
      "A gel round wrapped in a friction-liquefying, impossible-to-wash-off color dye layered over glitter-based micro RFID tags that embed in skin and broadcast to the Matrix. No AR/DV change. Prices at 2x a weapon class's base Regular-ammo cost - shown here against the Heavy Pistol/SMG base (10¥); recompute at the same 2x multiplier for other classes.",
  },

  // --- Explosives: Grenades ---
  {
    id: "krime-cleaner-grenade",
    name: "Krime Cleaner Grenade",
    category: "weapon",
    subcategory: "Explosives",
    cost: 200,
    availability: "5(I)",
    summary:
      "Deploys a solvent cloud over a 15m radius that unravels DNA evidence, fingerprint oils, and tracking-magic residue within 1D6 minutes; also bleaches dyes and dissolves most synthleather. Deals no damage. Banned by international agreement.",
  },
  {
    id: "krime-party-grenade",
    name: "Krime Party Grenade",
    category: "weapon",
    subcategory: "Explosives",
    cost: 190,
    availability: "7(I)",
    summary:
      "A combined fragmentation/flash-bang grenade in one shell - shrapnel for anyone who survives the initial flash-bang effect. Comes with Metahuman Adaptation. Wireless Bonus: acts as a Rating 1 area jammer for 1 round, broadcasting an uploaded sound (default: a voice shouting \"KRIME!!!!!\").",
    stats: { damageGroundZero: "16P / 10S (flash-bang)", damageClose: "12P / 8S (flash-bang)", damageNear: "8P / 6S (flash-bang)", blast: "20m / 15m (flash-bang)" },
  },
  {
    id: "krime-cocktail",
    name: "Krime Cocktail",
    category: "weapon",
    subcategory: "Explosives",
    cost: 100,
    availability: "7(I)",
    summary: "A napalm-like incendiary grenade that emits thick oily smoke; victims tend to pass out from smoke inhalation before burning.",
    stats: { damageGroundZero: "10P (fire)", damageClose: "4P (fire)", damageNear: "2P (fire)", blast: "5m" },
  },
  {
    id: "krime-stinger",
    name: "Krime Stinger",
    category: "weapon",
    subcategory: "Explosives",
    cost: 125,
    availability: "4(L)",
    summary:
      "A rubber-framed impact grenade that flings 144 gelatin balls outward on detonation instead of relying on sound/light; the initial charge can also ignite anything flammable nearby.",
    stats: { damageGroundZero: "16S", damageClose: "12S", damageNear: "8S", blast: "20m" },
  },
];
