import { Router } from "express";
import { priorityTable, metatypeAttributes } from "../rules/priority-tables.js";
import { metavariants } from "../rules/metavariants.js";
import { startingModules, adultModules } from "../rules/lifepath-modules.js";
import { skillList, skillLinkedAttribute } from "../rules/skills.js";
import { positiveQualities, negativeQualities } from "../rules/qualities.js";
import { weaponGear } from "../rules/gear.js";
import { armorGear } from "../rules/armor.js";
import { generalGear } from "../rules/generalGear.js";
import { electronicsGear } from "../rules/electronics.js";
import { augmentationsGear } from "../rules/augmentations.js";
import { magicalEquipmentGear } from "../rules/magicalEquipment.js";
import { vehiclesGear } from "../rules/vehicles.js";
import { vehicleUpgradesGear } from "../rules/vehicleUpgrades.js";
import { vehicleModsDoubleClutchGear } from "../rules/vehicleModsDoubleClutch.js";
import { dronesGear } from "../rules/drones.js";
import { packs } from "../rules/packs.js";
import { coreSpells } from "../rules/spells.js";
import { streetWyrdSpells } from "../rules/spellsStreetWyrd.js";
import { coreAdeptPowers } from "../rules/adeptPowers.js";
import { streetWyrdAdeptPowers } from "../rules/adeptPowersStreetWyrd.js";
import { lifestyles } from "../rules/lifestyles.js";
import { coreComplexForms } from "../rules/complexForms.js";
import { hackAndSlashComplexForms } from "../rules/complexFormsHackAndSlash.js";
import { coreNpcTemplates } from "../rules/npcTemplates.js";
import { coreCritterTemplates } from "../rules/critters.js";
import { bodyShopCritterTemplates } from "../rules/bodyShopCritters.js";
import { hackAndSlashCritterTemplates } from "../rules/hackAndSlashCritters.js";
import { hackAndSlashSecurityTemplates } from "../rules/hackAndSlashSecurity.js";
import { firingSquadTemplates } from "../rules/firingSquadCritters.js";
import { collapsingNowTemplates } from "../rules/collapsingNowCritters.js";
import { spirits } from "../rules/spirits.js";
import { spiritPowers } from "../rules/spiritPowers.js";

export const rulesRouter = Router();

rulesRouter.get("/priority-tables", (_req, res) => {
  res.json({ priorityTable, metatypeAttributes, metavariants, skillList, skillLinkedAttribute });
});

rulesRouter.get("/lifepath-modules", (_req, res) => {
  res.json({ startingModules, adultModules });
});

rulesRouter.get("/qualities", (_req, res) => {
  res.json({ positiveQualities, negativeQualities });
});

rulesRouter.get("/gear", (_req, res) => {
  res.json({
    gear: [
      ...weaponGear,
      ...armorGear,
      ...generalGear,
      ...electronicsGear,
      ...augmentationsGear,
      ...magicalEquipmentGear,
      ...vehiclesGear,
      ...vehicleUpgradesGear,
      ...vehicleModsDoubleClutchGear,
      ...dronesGear,
    ],
  });
});

rulesRouter.get("/packs", (_req, res) => {
  res.json({ packs });
});

rulesRouter.get("/spells", (_req, res) => {
  res.json({ spells: [...coreSpells, ...streetWyrdSpells] });
});

rulesRouter.get("/adept-powers", (_req, res) => {
  res.json({ adeptPowers: [...coreAdeptPowers, ...streetWyrdAdeptPowers] });
});

rulesRouter.get("/lifestyles", (_req, res) => {
  res.json({ lifestyles });
});

rulesRouter.get("/complex-forms", (_req, res) => {
  res.json({ complexForms: [...coreComplexForms, ...hackAndSlashComplexForms] });
});

rulesRouter.get("/npc-templates", (_req, res) => {
  res.json({
    npcTemplates: [
      ...coreNpcTemplates,
      ...coreCritterTemplates,
      ...bodyShopCritterTemplates,
      ...hackAndSlashCritterTemplates,
      ...hackAndSlashSecurityTemplates,
      ...firingSquadTemplates,
      ...collapsingNowTemplates,
    ],
  });
});

rulesRouter.get("/spirits", (_req, res) => {
  res.json({ spirits, spiritPowers });
});
