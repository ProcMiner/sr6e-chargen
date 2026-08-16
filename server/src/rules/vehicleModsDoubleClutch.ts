// Gear catalog - Double Clutch (Rigger Sourcebook) vehicle modifications,
// built specifically to support the Companion's Vehicle Upgrade PACKs
// (pp. 71: Dirty Tricks, Gun Ports, Rigger's Baby, Combat Biker - see
// packs.ts), the last piece of the gear-catalog rollout (see
// gear_catalog_rollout memory). Not the full Double Clutch mod catalog -
// only the ~18 distinct modifications those 4 PACKs actually reference,
// transcribed directly from the book (Chassis Mods pp. 122-129, Skin Mods
// p. 133, Powertrain Mods pp. 134-138). Shares the "Vehicle Modifications"
// subcategory with vehicleUpgrades.ts's core-rulebook entries so both show
// up together in the picker.
//
// "Rigger Adaptation" (referenced constantly in Double Clutch's own vehicle
// stat blocks) has no separate price/stat block anywhere in this book's
// modification chapter - it's the same core-rulebook concept already
// catalogued as "Rigger Interface" in vehicleUpgrades.ts, just under
// Double Clutch's own name for it. Reused there, not duplicated here.
//
// Mod-slot costs and the vehicle-Body-based mod-slot budget itself aren't
// modeled - same simplification this app already applies to weapon-mount
// capacity in vehicleUpgrades.ts. Two of the four PACKs these support also
// print a "Vehicle's Body must be at least N" prerequisite; not enforced
// anywhere (reference text only, same treatment as every other
// player-self-enforces mechanic in this app, e.g. Weapon Focus's "choose
// one weapon you own").

import type { GearCatalogEntry } from "./gear.js";

export const vehicleModsDoubleClutchGear: GearCatalogEntry[] = [
  {
    id: "dc-gun-port",
    name: "Gun Port",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 1000,
    availability: "3(L)",
    summary:
      "A firing position for one passenger's hand-held weapon, still fully protected by the vehicle's armor. One port = one simultaneous firer in that facing; buy more for more shooters.",
  },
  {
    id: "dc-improved-handling",
    name: "Improved Handling",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 18000,
    availability: "5",
    levels: { min: 1, max: 2 },
    summary: "Subtracts its rating directly from the vehicle's base Handling stat, on- and off-road alike.",
  },
  {
    id: "dc-rigger-cocoon",
    name: "Rigger Cocoon",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 3000,
    availability: "4",
    summary:
      "Replaces the driver's seat for a jumped-in rigger's safety and comfort: rating 6 passenger protection, Fire Resistance 2, integrated biomonitor, rating 2 life safety system (4 hours O2). Not installable on drones.",
  },
  {
    id: "dc-smuggling-compartment",
    name: "Smuggling Compartment",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 1000,
    availability: "4(I)",
    levels: { min: 1, max: 4 },
    summary:
      "Hidden cargo space sized in CF (cargo-feet, this catalog's rating). Detection is a Perception test, threshold (8 - CF).",
  },
  {
    id: "dc-electromagnetic-shielding",
    name: "Electromagnetic Shielding",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 1000,
    availability: "3(L)",
    levels: { min: 1, max: 4 },
    summary:
      "Turns a smuggling compartment (or any cargo section) into a Faraday cage, blocking wireless signals through it. Rating should match the compartment's own CF.",
  },
  {
    id: "dc-elemental-hardening",
    name: "Elemental Hardening",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 1000,
    availability: "-",
    levels: { min: 1, max: 6 },
    summary: "Chemical, cold, fire, or electricity resistance (pick one type per purchase) - equivalent to the armor mods, core rulebook p. 266.",
  },
  {
    id: "dc-improved-acceleration",
    name: "Improved Acceleration",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 15000,
    availability: "3",
    levels: { min: 1, max: 2 },
    summary: "Each rank adds 30% of the vehicle's base Acceleration (rounded up), for both speeding up and stopping.",
  },
  {
    id: "dc-nitro-boost",
    name: "Nitro Boost",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 5000,
    availability: "3(I)",
    summary: "Minor Action: doubles Acceleration for 1D6 rounds: vehicle tests during that window convert one die to a Wild Die.",
  },
  {
    id: "dc-improved-stability",
    name: "Improved Stability",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 7000,
    availability: "3",
    levels: { min: 1, max: 3 },
    summary: "Each rank reduces the vehicle's Speed Interval penalty by one, letting it reach higher speed before incurring negative modifiers.",
  },
  {
    id: "dc-top-speed-increase",
    name: "Top Speed Increase",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 8000,
    availability: "3",
    levels: { min: 1, max: 3 },
    summary: "Each rank adds 20% to the vehicle's base Top Speed.",
  },
  {
    id: "dc-electrochromic-paint",
    name: "Electrochromic Paint",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 1500,
    availability: "2",
    summary: "The Electrochromic Feature (core rulebook p. 265) for a vehicle's exterior - change color/livery with a Minor Action. Not camouflage.",
  },
  {
    id: "dc-oil-slick-sprayer",
    name: "Oil Slick Sprayer",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 1000,
    availability: "4(I)",
    summary:
      "Minor Action: slicks the road behind the vehicle. Pursuing ground vehicles take +3 Handling unless they pass a Crash test to avoid it. Six charges, refills for 50¥.",
  },
  {
    id: "dc-road-strip-ejector",
    name: "Road Strip Ejector",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 1000,
    availability: "4(I)",
    summary:
      "Minor Action release mechanism for one type of road strip (spike/tracking/zapper, bought separately), capacity six strips. Single strips can also be deployed and triggered manually.",
  },
  {
    id: "dc-spike-strip",
    name: "Spike Strip",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 250,
    availability: "3(I)",
    summary: "Blows out the tires of any vehicle that drives over it (forcing a Handling test to avoid crashing) unless it has run-flat tires.",
  },
  {
    id: "dc-thermal-smoke-projector",
    name: "Thermal Smoke Projector",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 700,
    availability: "3(L)",
    summary:
      "Minor Action: releases a dense smoke cloud (Blinded I acting through it, Blinded II acting from within), loaded with thermal smoke for concealment against thermographic vision too. Base Smoke Projector is 600¥; this is the +100¥ thermal-loaded version.",
  },
  {
    id: "dc-gas-dispersal-system",
    name: "Gas Dispersal System",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 2000,
    availability: "5(L)",
    summary:
      "Minor Action: releases up to 5 doses of a toxin (bought separately - not modeled in this catalog) at Range 2, Concentration equal to doses released. A rating 3 anti-theft system can also trigger it on alarm.",
  },
  {
    id: "dc-shredder-tires",
    name: "Shredder Tires",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 1200,
    availability: "4(I)",
    summary:
      "Blade-ringed tires, illegal everywhere but the barrens - add the vehicle's Body (half Body vs. another vehicle) to its ramming Attack Rating. Car/truck tire-set price; drone/motorcycle sets are cheaper (600¥) but not separately catalogued.",
  },
  {
    id: "dc-spoof-kit",
    name: "Spoof Kit",
    category: "vehicle",
    subcategory: "Vehicle Modifications",
    cost: 1500,
    availability: "4(I)",
    summary:
      "Morphing license plate + ID-mimicking transponder signal - spoofs GridGuide/SkyGuide/xGuide tracking with a random-but-authentic-looking ID. Won't survive active scrutiny. Change the pattern with a Minor Action.",
  },
];
