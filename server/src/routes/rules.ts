import { Router } from "express";
import { priorityTable, metatypeAttributes } from "../rules/priority-tables.js";
import { startingModules, adultModules } from "../rules/lifepath-modules.js";
import { skillList } from "../rules/skills.js";
import { positiveQualities, negativeQualities } from "../rules/qualities.js";

export const rulesRouter = Router();

rulesRouter.get("/priority-tables", (_req, res) => {
  res.json({ priorityTable, metatypeAttributes, skillList });
});

rulesRouter.get("/lifepath-modules", (_req, res) => {
  res.json({ startingModules, adultModules });
});

rulesRouter.get("/qualities", (_req, res) => {
  res.json({ positiveQualities, negativeQualities });
});
