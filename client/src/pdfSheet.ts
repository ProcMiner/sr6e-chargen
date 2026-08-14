// Fills the official "Genesis" SR6 character sheet template
// (public/character-sheet-template.pdf, by Stefan & Anja Prelle,
// http://rpgframework.de) with a character's data, producing a downloadable
// PDF. The template has no fillable form fields (verified: only 42 checkbox
// widgets for the Condition Monitor boxes, no text fields at all) - a
// hand-drawn print form, not a fillable one. So every value here is drawn as
// text at a fixed coordinate, hand-mapped against the template's own word
// bounding boxes (extracted via `pdftotext -bbox`, PDF points, page 595x842
// - A4). Coordinates are annotated with the label they sit next to so a
// future template-layout change can be re-mapped without starting over.
//
// Only pages 1-2 of the template's 6 are filled (Personal Data, Attributes,
// Qualities, Condition Monitor, Skills, Weapons, Armor, Augmentations, Gear,
// Contacts, Lifestyles, Matrix Devices, Vehicles/Drones) - the user's
// explicit choice over a magic/technomancer page and the front-page-only
// option. Pages 3, 5, 6 are pure static rules reference (combat sequence,
// Edge boost catalog) with nothing character-specific to fill; page 4
// (Spells/Adept Powers/Foci/Rituals/Astral Combat) is deliberately deferred.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { CharacterData, GearLine } from "./character";
import type {
  GearCatalogEntry,
  GearRulesResponse,
  MetatypeAttributes,
  PriorityRulesResponse,
  QualityRulesResponse,
} from "./rules";
import { deriveStats, astralInitiative, composure, defenseTestPool, judgeIntentions, liftCarry, memory, minorActions } from "./derive";
import { currentEssence, effectiveMagic, effectiveResonance } from "./deriveEssence";
import { nuyenRemaining, karmaRemaining } from "./deriveGear";
import { modifierBonuses } from "./deriveModifiers";
import { lifestyleCostTotal } from "./deriveLifestyle";
import { metavariantKarmaCost, combinedRacialQualities, findMetavariant } from "./deriveMetavariant";
import { combineQualityCatalog, qualityDisplayName } from "./deriveQualities";
import { livingPersonaAttribute } from "./deriveLivingPersona";

const PAGE_HEIGHT = 842;

function y(fromTop: number): number {
  // The template's bbox coordinates are measured from the top of the page;
  // pdf-lib draws from the bottom-left. `fromTop` is a label's yMax (bottom
  // edge of its glyphs), which converts directly to a same-size value's
  // baseline with no further nudge - confirmed by rendering calibration
  // markers against the actual template and comparing pixel alignment.
  return PAGE_HEIGHT - fromTop;
}

function truncate(text: string, maxChars: number): string {
  return text.length > maxChars ? text.slice(0, maxChars - 1) + "…" : text;
}

interface DrawCtx {
  font: PDFFont;
}

function draw(page: PDFPage, ctx: DrawCtx, text: string | number | undefined, x: number, fromTop: number, size = 7) {
  if (text === undefined || text === "") return;
  page.drawText(String(text), { x, y: y(fromTop), size, font: ctx.font, color: rgb(0.08, 0.08, 0.08) });
}

interface SheetInputs {
  characterAlias: string;
  data: CharacterData;
  priorityRules: PriorityRulesResponse;
  metatypeAttributes: MetatypeAttributes[];
  qualityRules: QualityRulesResponse;
  gearRules: GearRulesResponse;
  spellKarmaSpent: number;
  complexFormKarmaSpent: number;
}

function findGearEntry(line: GearLine, catalog: GearCatalogEntry[]): GearCatalogEntry | undefined {
  return line.itemId ? catalog.find((g) => g.id === line.itemId) : undefined;
}

const MELEE_SUBCATEGORIES = new Set(["Blades", "Clubs", "Melee (Other)"]);
const WEAPON_EXCLUDED_SUBCATEGORIES = new Set(["Ammunition", "Weapon Accessories", "Explosives"]);
const MATRIX_DEVICE_SUBCATEGORIES = new Set(["Commlinks", "Cyberdecks"]);

function bucketGear(data: CharacterData, catalog: GearCatalogEntry[]) {
  const ranged: { line: GearLine; entry?: GearCatalogEntry }[] = [];
  const melee: { line: GearLine; entry?: GearCatalogEntry }[] = [];
  const armor: { line: GearLine; entry?: GearCatalogEntry }[] = [];
  const augmentations: { line: GearLine; entry?: GearCatalogEntry }[] = [];
  const matrixDevices: { line: GearLine; entry?: GearCatalogEntry }[] = [];
  const vehicles: { line: GearLine; entry?: GearCatalogEntry }[] = [];
  const drones: { line: GearLine; entry?: GearCatalogEntry }[] = [];
  const general: { line: GearLine; entry?: GearCatalogEntry }[] = [];

  for (const line of data.gear) {
    const entry = findGearEntry(line, catalog);
    const category = entry?.category;
    const subcategory = entry?.subcategory;

    if (category === "weapon" && subcategory && !WEAPON_EXCLUDED_SUBCATEGORIES.has(subcategory)) {
      (MELEE_SUBCATEGORIES.has(subcategory) ? melee : ranged).push({ line, entry });
    } else if (category === "armor" && subcategory !== "Armor Modifications") {
      armor.push({ line, entry });
    } else if (category === "augmentation" || (line.essenceCost ?? 0) > 0) {
      augmentations.push({ line, entry });
    } else if (category === "electronics" && subcategory && MATRIX_DEVICE_SUBCATEGORIES.has(subcategory)) {
      matrixDevices.push({ line, entry });
    } else if (category === "vehicle" && subcategory && /drone/i.test(subcategory)) {
      drones.push({ line, entry });
    } else if (category === "vehicle") {
      vehicles.push({ line, entry });
    } else {
      general.push({ line, entry });
    }
  }
  return { ranged, melee, armor, augmentations, matrixDevices, vehicles, drones, general };
}

function drawPage1(page: PDFPage, ctx: DrawCtx, inputs: SheetInputs) {
  const { data, priorityRules, metatypeAttributes, qualityRules } = inputs;
  const derived = deriveStats(data.attributes, modifierBonuses(data.gear, data.adeptPowers));
  const essence = currentEssence(data);
  const magicEffective = effectiveMagic(data);
  const resonanceEffective = effectiveResonance(data);
  const selectedMetavariant = findMetavariant(data, priorityRules.metavariants);
  const extraKarmaSpent = inputs.spellKarmaSpent + inputs.complexFormKarmaSpent + metavariantKarmaCost(data, priorityRules.metavariants);
  const karmaSpendable = karmaRemaining(data, extraKarmaSpent);
  const nuyenSpendable = nuyenRemaining(data, lifestyleCostTotal(data.lifestyles));

  // --- EDGE / ¥ box ---
  draw(page, ctx, data.attributes.edge, 400, 51.5, 8);
  draw(page, ctx, `${nuyenSpendable.toLocaleString()}¥`, 400, 109.5, 8);

  // --- Personal Data (rows every 12pt starting y=115) ---
  draw(page, ctx, inputs.characterAlias, 45, 123, 8);
  const metatypeText = selectedMetavariant ? `${data.metatype} (${selectedMetavariant.name})` : data.metatype ?? "";
  draw(page, ctx, metatypeText, 60, 135, 8);
  const magicOrResonance =
    magicEffective > 0 ? `Magic ${magicEffective}` : resonanceEffective > 0 ? `Resonance ${resonanceEffective}` : "";
  draw(page, ctx, magicOrResonance, 248, 135, 8);
  draw(page, ctx, karmaSpendable, 50, 171, 8);
  draw(page, ctx, data.karma, 190, 171, 8);
  draw(page, ctx, essence.toFixed(2).replace(/\.?0+$/, ""), 292, 171, 8);

  // --- Attributes (left column, Rtg only - no universal "Pool" formula for a raw attribute alone) ---
  const attrRows: [number | undefined, number][] = [
    [data.attributes.body, 220],
    [data.attributes.agility, 232],
    [data.attributes.reaction, 244],
    [data.attributes.strength, 256],
    [data.attributes.willpower, 268],
    [data.attributes.logic, 280],
    [data.attributes.intuition, 292],
    [data.attributes.charisma, 304],
    [data.attributes.edge, 316],
    [magicEffective > 0 ? magicEffective : undefined, 328],
  ];
  for (const [value, rowY] of attrRows) draw(page, ctx, value, 126, rowY);

  // --- Attributes (right column - "Attribute-Only Tests," core rulebook p. 68) ---
  draw(page, ctx, minorActions(derived), 300, 220);
  draw(page, ctx, `${derived.initiative} + ${derived.initiativeDice}d6`, 300, 232);
  if (data.attributes.resonance !== undefined) {
    const vrInit = data.attributes.intuition + livingPersonaAttribute(data, "dataProcessing");
    draw(page, ctx, `${vrInit} + 1d6 (cold sim)`, 300, 244);
  }
  if (data.attributes.magic !== undefined) {
    draw(page, ctx, `${astralInitiative(data.attributes)} + 2d6`, 300, 256);
  }
  draw(page, ctx, defenseTestPool(data.attributes), 300, 268);
  draw(page, ctx, composure(data.attributes), 300, 280);
  draw(page, ctx, judgeIntentions(data.attributes), 300, 292);
  draw(page, ctx, memory(data.attributes), 300, 304);
  draw(page, ctx, liftCarry(data.attributes), 300, 316);
  if (resonanceEffective > 0) draw(page, ctx, resonanceEffective, 284, 328);

  // --- Qualities (two columns, small font, each entry one line) ---
  const qualityCatalog = combineQualityCatalog(qualityRules);
  const racial = combinedRacialQualities(data, metatypeAttributes, priorityRules.metavariants);
  const positive = [
    ...racial.map((name) => `${name} (racial)`),
    ...data.qualities
      .filter((sel) => qualityCatalog.find((q) => q.id === sel.id)?.category === "positive")
      .map((sel) => qualityDisplayName(sel, qualityCatalog)),
  ];
  const negative = data.qualities
    .filter((sel) => qualityCatalog.find((q) => q.id === sel.id)?.category === "negative")
    .map((sel) => qualityDisplayName(sel, qualityCatalog));
  positive.slice(0, 14).forEach((name, i) => draw(page, ctx, truncate(name, 34), 349, 217 + i * 9, 6.5));
  negative.slice(0, 14).forEach((name, i) => draw(page, ctx, truncate(name, 22), 465, 217 + i * 9, 6.5));

  // --- Condition Monitor healing formulas ---
  draw(page, ctx, data.attributes.body + data.attributes.willpower, 92, 366.5, 7);
  draw(page, ctx, data.attributes.body * 2, 290, 366.5, 7);

  // --- Skills (two columns, 9 rows each) ---
  const skillEntries = Object.entries(data.skills).filter(([, rank]) => rank > 0);
  const skillCols: [number, number][] = [
    [24, 443],
    [236.89, 443],
  ];
  skillEntries.slice(0, 18).forEach(([skill, rank], i) => {
    const col = i < 9 ? skillCols[0] : skillCols[1];
    const rowY = col[1] + (i % 9) * 12;
    const attrKey = priorityRules.skillLinkedAttribute[skill];
    const attrValue = attrKey ? (data.attributes as unknown as Record<string, number | undefined>)[attrKey] : undefined;
    draw(page, ctx, truncate(skill, 16), col[0], rowY, 6.5);
    if (attrKey) draw(page, ctx, attrKey.slice(0, 3).toUpperCase(), col[0] + 90, rowY, 6.5);
    draw(page, ctx, rank, col[0] + 122, rowY, 6.5);
    if (attrValue !== undefined) draw(page, ctx, rank + attrValue, col[0] + 151, rowY, 6.5);
  });
  data.knowledgeSkills.slice(0, 18).forEach((name, i) => {
    draw(page, ctx, truncate(name, 32), 449.77, 443 + i * 12, 6.5);
  });

  // --- Weapons & Armor ---
  const { ranged, melee, armor } = bucketGear(data, inputs.gearRules.gear);
  ranged.slice(0, 6).forEach(({ line, entry }, i) => {
    const rowY = 579 + i * 12;
    draw(page, ctx, truncate(line.name, 20), 24, rowY, 6.5);
    draw(page, ctx, entry?.stats?.damage, 154, rowY, 6.5);
    draw(page, ctx, entry?.stats?.attackRatings, 203, rowY, 6.5);
    draw(page, ctx, entry?.stats?.modes, 260, rowY, 6.5);
    draw(page, ctx, entry?.stats?.ammo, 305, rowY, 6.5);
  });
  melee.slice(0, 3).forEach(({ line, entry }, i) => {
    const rowY = 663 + i * 12;
    draw(page, ctx, truncate(line.name, 20), 24, rowY, 6.5);
    draw(page, ctx, entry?.stats?.damage, 182, rowY, 6.5);
    draw(page, ctx, entry?.stats?.attackRatings, 278, rowY, 6.5);
  });
  armor.slice(0, 6).forEach(({ line, entry }, i) => {
    const rowY = 590 + i * 12;
    draw(page, ctx, truncate(line.name, 24), 345.9, rowY, 6.5);
    draw(page, ctx, entry?.stats?.defenseRating, 494, rowY, 6.5);
  });
}

function drawPage2(page: PDFPage, ctx: DrawCtx, inputs: SheetInputs) {
  const { data } = inputs;
  const { augmentations, general, matrixDevices, vehicles, drones } = bucketGear(data, inputs.gearRules.gear);

  // --- Augmentations ---
  augmentations.slice(0, 9).forEach(({ line }, i) => {
    const rowY = 60 + i * 12;
    draw(page, ctx, truncate(line.name, 26), 24, rowY, 6.5);
    if (line.rating) draw(page, ctx, line.rating, 170.99, rowY, 6.5);
    draw(page, ctx, line.essenceCost, 207.14, rowY, 6.5);
  });
  // The "Act. Essence (__) = __ - Hole (__) - Sum augmentations (__)" footer
  // is a 3-blank formula; "Hole" (Essence hole from bioware overclocking)
  // isn't tracked anywhere in this app, so it's deliberately left blank
  // rather than half-filled - Essence itself is already shown on page 1.

  // --- Gear (catch-all) ---
  general.slice(0, 21).forEach(({ line }, i) => {
    const rowY = 60 + i * 12;
    draw(page, ctx, truncate(line.name, 62), 307.05, rowY, 6.5);
    draw(page, ctx, line.qty, 486.82, rowY, 6.5);
  });

  // --- Contacts ---
  data.contacts.slice(0, 14).forEach((contact, i) => {
    const rowY = 340 + i * 12;
    draw(page, ctx, truncate(contact.name, 18), 24, rowY, 6.5);
    draw(page, ctx, contact.connection, 255.15, rowY, 6.5);
    draw(page, ctx, contact.loyalty, 231.45, rowY, 6.5);
  });

  // --- Lifestyles ---
  data.lifestyles.slice(0, 3).forEach((lifestyle, i) => {
    const rowY = 340 + i * 12;
    draw(page, ctx, truncate(lifestyle.name, 24), 307.05, rowY, 6.5);
    draw(page, ctx, `${lifestyle.costPerMonth.toLocaleString()}¥`, 517.5, rowY, 6.5);
    draw(page, ctx, lifestyle.monthsPrepaid, 546.86, rowY, 6.5);
  });

  // --- Matrix Devices ---
  matrixDevices.slice(0, 7).forEach(({ line }, i) => {
    const rowY = 536 + i * 12;
    draw(page, ctx, truncate(line.name, 20), 24, rowY, 6.5);
  });

  // --- Currency ---
  draw(page, ctx, `${nuyenRemaining(data, lifestyleCostTotal(data.lifestyles)).toLocaleString()}¥ on hand`, 307.05, 526, 7);

  // --- Vehicles / Drones ---
  vehicles.slice(0, 4).forEach(({ line, entry }, i) => {
    const rowY = 648 + i * 12;
    const stats = entry?.stats ?? {};
    draw(page, ctx, truncate(line.name, 30), 24, rowY, 6.5);
    draw(page, ctx, stats["Handling (On/Off-road)"], 293.57, rowY, 6.5);
    draw(page, ctx, stats["Acceleration"], 328.59, rowY, 6.5);
    draw(page, ctx, stats["Speed Interval"], 359.64, rowY, 6.5);
    draw(page, ctx, stats["Top Speed"], 388.39, rowY, 6.5);
    draw(page, ctx, stats["Body"], 453.91, rowY, 6.5);
    draw(page, ctx, stats["Armor"], 487.0, rowY, 6.5);
    draw(page, ctx, stats["Seats"], 550.07, rowY, 6.5);
  });
  const droneCount = drones.reduce((sum, { line }) => sum + line.qty, 0);
  if (droneCount > 0) {
    const names = drones.map(({ line }) => truncate(line.name, 40)).join(", ");
    draw(page, ctx, names, 24, 701, 6.5);
    draw(page, ctx, droneCount, 192.82, 701, 6.5);
  }
}

export async function generateCharacterSheetPdf(inputs: SheetInputs): Promise<Uint8Array> {
  const templateBytes = await fetch("/character-sheet-template.pdf").then((r) => r.arrayBuffer());
  const doc = await PDFDocument.load(templateBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const ctx: DrawCtx = { font };

  const pages = doc.getPages();
  drawPage1(pages[0], ctx, inputs);
  drawPage2(pages[1], ctx, inputs);

  return doc.save();
}

export function downloadCharacterSheetPdf(bytes: Uint8Array, characterAlias: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${characterAlias || "character"}-sheet.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
