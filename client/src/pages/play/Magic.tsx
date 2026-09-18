// The Magic chapter (core rulebook pp. 126-168): a sub-tabbed Magic
// Companion for live play - Casting/Spells/Powers/Skills/Reference/Workshop
// - the Magic-side counterpart to Matrix.tsx, built the same way: the one
// thing a magician or adept's player actually opens at the table instead of
// flipping between the character sheet and the rulebook. Same "no
// dice-rolling engine" boundary as every other Live Play tab: every
// opposed/extended test (the Spellcasting test itself, Drain resistance,
// Conjuring/Enchanting tests) stays a reference formula; only what's
// directly computable from the character's own data (dice pools, PP pool,
// Drain resistance pool) is a live number.
//
// Sustained Spells (PlayState.sustainedSpells) is the one session-transient
// tracker on this tab, same tier as Matrix's running programs/Overwatch -
// and it's more than a checklist: a sustained spell with a `modifiers`
// entry (Increase Reflexes, Armor - see rules.ts's StatModifier) feeds a
// live bonus back into AttributesDerivedCard/Combat.tsx via
// deriveModifiers.ts's sustainedSpellBonuses(), closing the gap flagged
// when StatModifier's "netHits" amount was first introduced (a spell's
// magnitude is a casting-roll result, only known once the player enters
// their own net hits here).
import { useState } from "react";
import type { CharacterData } from "../../character";
import type {
  AdeptPowerRulesResponse,
  ModifierTarget,
  PriorityRulesResponse,
  SpellCatalogEntry,
  SpellRulesResponse,
} from "../../rules";
import type { PlayState, SustainedSpell } from "../../playState";
import { effectiveAttributes } from "../../derive";
import { modifierBonuses } from "../../deriveModifiers";
import { currentEssence, effectiveMagic, formatEssence } from "../../deriveEssence";
import {
  adeptDrainResistancePool,
  centeringDrainBonus,
  traditionDrainResistancePool,
} from "../../deriveAstral";
import {
  adeptPowerPointPool,
  adeptPowerPointsSpent,
  adeptPowerUnitCost,
  findAdeptPowerEntry,
  getMagicOrAwakenedType,
  isAdept,
  isMysticAdept,
  ratingFor as adeptPowerRatingFor,
} from "../../deriveAdeptPowers";
import { freeSpellAllotment, KARMA_PER_SPELL } from "../../deriveSpells";
import { karmaRemaining, nuyenRemaining } from "../../deriveGear";
import { generateId } from "../../id";

type Tab = "casting" | "spells" | "powers" | "skills" | "reference" | "workshop";

const SPELL_CATEGORIES: SpellCatalogEntry["category"][] = ["Combat", "Detection", "Health", "Illusion", "Manipulation"];

const ATTRIBUTE_CHOICES: { value: NonNullable<SustainedSpell["targetAttribute"]>; label: string }[] = [
  { value: "body", label: "Body" },
  { value: "agility", label: "Agility" },
  { value: "reaction", label: "Reaction" },
  { value: "strength", label: "Strength" },
  { value: "willpower", label: "Willpower" },
  { value: "logic", label: "Logic" },
  { value: "intuition", label: "Intuition" },
  { value: "charisma", label: "Charisma" },
];

const MODIFIER_TARGET_LABELS: Partial<Record<ModifierTarget, string>> = {
  body: "Body",
  agility: "Agility",
  reaction: "Reaction",
  strength: "Strength",
  willpower: "Willpower",
  logic: "Logic",
  intuition: "Intuition",
  charisma: "Charisma",
  initiativeDice: "Initiative Dice",
  armor: "Armor",
};

function spellStatLine(entry: SpellCatalogEntry): string {
  const parts = [entry.range, entry.type, entry.duration, `DV ${entry.drainValue}`];
  if (entry.damage) parts.push(entry.damage);
  return parts.join(" • ");
}

/** True if casting this spell needs the caster to pick a target attribute (Increase/Decrease Attribute) rather than the effect landing on a fixed one. */
function needsTargetAttribute(entry: SpellCatalogEntry | undefined): boolean {
  return !!entry?.modifiers?.some((m) => m.target === "choice");
}

/** Readable per-instance effect lines for a sustained spell, mirroring deriveModifiers.ts's sustainedSpellBonuses() math but labeled for display instead of summed into a bonus map. */
function instanceEffectLines(instance: SustainedSpell, entry: SpellCatalogEntry | undefined): string[] {
  if (!entry?.modifiers) return [];
  const sign = entry.id === "spell-decrease-attribute" ? -1 : 1;
  const lines: string[] = [];
  for (const m of entry.modifiers) {
    if (m.amount !== "netHits") continue;
    const target = m.target === "choice" ? instance.targetAttribute : m.target;
    if (!target) continue;
    const amount = instance.netHits * sign;
    const label = MODIFIER_TARGET_LABELS[target] ?? target;
    lines.push(`${amount >= 0 ? "+" : ""}${amount} ${label}`);
  }
  return lines;
}

interface Props {
  data: CharacterData;
  spellRules: SpellRulesResponse;
  adeptPowerRules: AdeptPowerRulesResponse;
  priorityRules?: PriorityRulesResponse;
  playState: PlayState;
  onChange: (next: PlayState) => void;
  extraKarmaSpent: number;
  extraNuyenSpent: number;
}

export function Magic({
  data,
  spellRules,
  adeptPowerRules,
  priorityRules,
  playState,
  onChange,
  extraKarmaSpent,
  extraNuyenSpent,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("casting");
  if (data.attributes.magic === undefined) return null;

  const adept = isAdept(data);
  const mysticAdept = isMysticAdept(data);
  const powersRelevant = adept || mysticAdept;
  const bonuses = modifierBonuses(data.gear, data.adeptPowers);
  const effectiveAttrs = effectiveAttributes(data.attributes, bonuses);

  function findSpell(id: string): SpellCatalogEntry | undefined {
    return spellRules.spells.find((s) => s.id === id);
  }

  function addSustained(entry: SustainedSpell) {
    onChange({ ...playState, sustainedSpells: [...playState.sustainedSpells, entry] });
  }
  function updateSustained(id: string, patch: Partial<SustainedSpell>) {
    onChange({
      ...playState,
      sustainedSpells: playState.sustainedSpells.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }
  function dropSustained(id: string) {
    onChange({ ...playState, sustainedSpells: playState.sustainedSpells.filter((s) => s.id !== id) });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "casting", label: "Casting" },
    { id: "spells", label: "Spells" },
    ...(powersRelevant ? [{ id: "powers" as Tab, label: "Powers" }] : []),
    { id: "skills", label: "Skills" },
    { id: "reference", label: "Reference" },
    { id: "workshop", label: "Workshop" },
  ];
  const currentTab = tabs.some((t) => t.id === activeTab) ? activeTab : tabs[0].id;

  return (
    <div className="magic-panel">
      <h2>Magic</h2>

      <div className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={t.id === currentTab ? "tab-bar-item active" : "tab-bar-item"}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {currentTab === "casting" && (
        <CastingTab
          data={data}
          effectiveAttrs={effectiveAttrs}
          adept={adept}
          mysticAdept={mysticAdept}
          playState={playState}
          findSpell={findSpell}
          onAddSustained={addSustained}
          onUpdateSustained={updateSustained}
          onDropSustained={dropSustained}
        />
      )}

      {currentTab === "spells" && (
        <SpellsTab
          data={data}
          spellRules={spellRules}
          priorityRules={priorityRules}
          playState={playState}
          onAddSustained={addSustained}
          onDropSustained={dropSustained}
        />
      )}

      {currentTab === "powers" && powersRelevant && <PowersTab data={data} adeptPowerRules={adeptPowerRules} />}

      {currentTab === "skills" && <SkillsTab data={data} effectiveAttrs={effectiveAttrs} />}

      {currentTab === "reference" && <ReferenceTab />}

      {currentTab === "workshop" && (
        <WorkshopTab data={data} extraKarmaSpent={extraKarmaSpent} extraNuyenSpent={extraNuyenSpent} />
      )}
    </div>
  );
}

function CastingTab({
  data,
  effectiveAttrs,
  adept,
  mysticAdept,
  playState,
  findSpell,
  onAddSustained,
  onUpdateSustained,
  onDropSustained,
}: {
  data: CharacterData;
  effectiveAttrs: ReturnType<typeof effectiveAttributes>;
  adept: boolean;
  mysticAdept: boolean;
  playState: PlayState;
  findSpell: (id: string) => SpellCatalogEntry | undefined;
  onAddSustained: (entry: SustainedSpell) => void;
  onUpdateSustained: (id: string, patch: Partial<SustainedSpell>) => void;
  onDropSustained: (id: string) => void;
}) {
  const magic = data.attributes.magic!;
  const magicEffective = effectiveMagic(data);
  const magicType = getMagicOrAwakenedType(data) ?? "Awakened";
  const traditionAttribute = data.traditionAttribute;
  const centeringBonus = centeringDrainBonus(data);

  const sustainable = data.spells
    .map((id) => findSpell(id))
    .filter((e): e is SpellCatalogEntry => !!e && e.duration === "S");
  const [addSpellId, setAddSpellId] = useState("");
  const [addNetHits, setAddNetHits] = useState("1");
  const [addTarget, setAddTarget] = useState<NonNullable<SustainedSpell["targetAttribute"]>>("body");
  const addEntry = addSpellId ? findSpell(addSpellId) : undefined;

  function submitAdd() {
    if (!addEntry) return;
    const netHits = Math.max(0, parseInt(addNetHits, 10) || 0);
    onAddSustained({
      id: generateId(),
      spellId: addEntry.id,
      netHits,
      targetAttribute: needsTargetAttribute(addEntry) ? addTarget : undefined,
      castAt: new Date().toISOString(),
    });
    setAddSpellId("");
    setAddNetHits("1");
  }

  return (
    <div>
      <div className="sheet-card">
        <div className="rules-kicker">Magic</div>
        <div className="kv-row">
          <span className="kv-label">Type</span>
          <span className="kv-value">{magicType}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Magic</span>
          <span className="kv-value">
            {magic}
            {magicEffective !== magic && <span className="kv-mod">{magicEffective > magic ? ` (+${magicEffective - magic})` : ` (${magicEffective - magic})`}</span>}
          </span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Essence</span>
          <span className="kv-value">{formatEssence(currentEssence(data))}</span>
        </div>
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Drain Resistance</div>
        {adept && !mysticAdept ? (
          <p className="hint">
            Adept Power Drain: Body + Willpower = <strong>{adeptDrainResistancePool(effectiveAttrs)}</strong>
          </p>
        ) : traditionAttribute ? (
          <>
            <p className="hint">
              Spellcasting/Conjuring/Enchanting Drain: Willpower + Tradition Attribute
              {centeringBonus > 0 && " + Centering"} ={" "}
              <strong>{traditionDrainResistancePool(effectiveAttrs, traditionAttribute) + centeringBonus}</strong>
            </p>
            {mysticAdept && (
              <p className="hint">
                Adept Power Drain: Body + Willpower = <strong>{adeptDrainResistancePool(effectiveAttrs)}</strong>
              </p>
            )}
          </>
        ) : (
          <p className="hint">Choose a Tradition Attribute (builder's Magic section) to compute this.</p>
        )}
        <p className="hint">
          Resisted with Stun damage (Physical if it exceeds current Magic). See the Astral tab for the full
          writeup.
        </p>
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Sustained Spells</div>
        <p className="hint">
          -2 dice pool penalty to any action test for each spell you sustain (core rulebook p.132) - currently
          sustaining {playState.sustainedSpells.length}, for a{" "}
          <strong>-{playState.sustainedSpells.length * 2}</strong> penalty to everything.
        </p>
        {playState.sustainedSpells.length > 0 && (
          <ul className="module-slots">
            {playState.sustainedSpells.map((s) => {
              const entry = findSpell(s.spellId);
              const effects = instanceEffectLines(s, entry);
              const wantsTarget = needsTargetAttribute(entry);
              return (
                <li key={s.id}>
                  <div className="module-instance">
                    <div className="module-instance-header">
                      <strong>{entry?.name ?? s.spellId}</strong>
                      <button className="danger" onClick={() => onDropSustained(s.id)}>
                        Drop
                      </button>
                    </div>
                    <div className="kv-row">
                      <span className="kv-label">Net hits</span>
                      <span className="stepper">
                        <button onClick={() => onUpdateSustained(s.id, { netHits: Math.max(0, s.netHits - 1) })}>-1</button>
                        <span className="kv-value">{s.netHits}</span>
                        <button onClick={() => onUpdateSustained(s.id, { netHits: s.netHits + 1 })}>+1</button>
                      </span>
                    </div>
                    {wantsTarget && (
                      <div className="kv-row">
                        <span className="kv-label">Target attribute</span>
                        <select
                          value={s.targetAttribute ?? "body"}
                          onChange={(e) =>
                            onUpdateSustained(s.id, { targetAttribute: e.target.value as SustainedSpell["targetAttribute"] })
                          }
                        >
                          {ATTRIBUTE_CHOICES.map((a) => (
                            <option key={a.value} value={a.value}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {effects.length > 0 && <p className="hint">Effect: {effects.join(", ")}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {sustainable.length > 0 ? (
          <div className="inline-field">
            <select value={addSpellId} onChange={(e) => setAddSpellId(e.target.value)}>
              <option value="">Sustain a spell...</option>
              {sustainable.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <label className="inline-field">
              Net hits
              <input
                type="number"
                min={0}
                value={addNetHits}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setAddNetHits(e.target.value)}
              />
            </label>
            {needsTargetAttribute(addEntry) && (
              <select value={addTarget} onChange={(e) => setAddTarget(e.target.value as typeof addTarget)}>
                {ATTRIBUTE_CHOICES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            )}
            <button onClick={submitAdd} disabled={!addSpellId}>
              Sustain
            </button>
          </div>
        ) : (
          <p className="hint">No known Sustained-duration spells - see the Spells tab.</p>
        )}
      </div>
    </div>
  );
}

function SpellsTab({
  data,
  spellRules,
  priorityRules,
  playState,
  onAddSustained,
  onDropSustained,
}: {
  data: CharacterData;
  spellRules: SpellRulesResponse;
  priorityRules?: PriorityRulesResponse;
  playState: PlayState;
  onAddSustained: (entry: SustainedSpell) => void;
  onDropSustained: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const searchTerm = search.trim().toLowerCase();
  const known = data.spells
    .map((id) => spellRules.spells.find((s) => s.id === id))
    .filter((e): e is SpellCatalogEntry => !!e)
    .filter((e) => !searchTerm || e.name.toLowerCase().includes(searchTerm) || e.summary.toLowerCase().includes(searchTerm));

  const free = freeSpellAllotment(data, priorityRules);

  function sustainedInstanceFor(spellId: string) {
    return playState.sustainedSpells.find((s) => s.spellId === spellId);
  }

  if (data.spells.length === 0) {
    return <p className="hint">No known spells. Spells are learned in the builder or via career-mode advancement.</p>;
  }

  return (
    <div>
      <p className="hint">
        {Math.min(data.spells.length, free)} / {free} free spells used
        {data.spells.length > free ? ` - ${data.spells.length - free} extra x ${KARMA_PER_SPELL} Karma` : ""}
      </p>
      <input
        type="search"
        className="full-width"
        placeholder="Search known spells…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {SPELL_CATEGORIES.map((category) => {
        const entries = known.filter((e) => e.category === category);
        if (entries.length === 0) return null;
        return (
          <details key={category} className="quality-section" open>
            <summary>
              {category} ({entries.length})
            </summary>
            {entries.map((entry) => {
              const sustaining = sustainedInstanceFor(entry.id);
              return (
                <div className="sheet-card" key={entry.id}>
                  <div className="kv-row">
                    <span className="kv-value">{entry.name}</span>
                    {entry.duration === "S" && (
                      <button
                        className={sustaining ? "chip selected" : "chip"}
                        onClick={() =>
                          sustaining
                            ? onDropSustained(sustaining.id)
                            : onAddSustained({
                                id: generateId(),
                                spellId: entry.id,
                                netHits: 1,
                                targetAttribute: needsTargetAttribute(entry) ? "body" : undefined,
                                castAt: new Date().toISOString(),
                              })
                        }
                      >
                        {sustaining ? "Sustaining" : "Sustain"}
                      </button>
                    )}
                  </div>
                  <p className="hint">{spellStatLine(entry)}</p>
                  <p className="hint">{entry.summary}</p>
                </div>
              );
            })}
          </details>
        );
      })}
      {searchTerm && known.length === 0 && <p className="hint">No known spells match "{search}".</p>}
    </div>
  );
}

function PowersTab({ data, adeptPowerRules }: { data: CharacterData; adeptPowerRules: AdeptPowerRulesResponse }) {
  const catalog = adeptPowerRules.adeptPowers;
  const pool = adeptPowerPointPool(data);
  const spent = adeptPowerPointsSpent(data.adeptPowers, catalog);
  const remaining = pool - spent;

  return (
    <div>
      <div className="sheet-card">
        <div className="rules-kicker">Power Points</div>
        <div className="kv-row">
          <span className="kv-label">Pool</span>
          <span className="kv-value">{pool}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Spent</span>
          <span className="kv-value">{spent}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Remaining</span>
          <span className="kv-value">{remaining}</span>
        </div>
        <p className="hint">Read-only here - edit powers on the builder's Adept Powers step.</p>
      </div>

      {data.adeptPowers.length === 0 ? (
        <p className="hint">No known adept powers.</p>
      ) : (
        data.adeptPowers.map((line, i) => {
          const entry = findAdeptPowerEntry(line.powerId, catalog);
          if (!entry) return null;
          const level = entry.levels ? adeptPowerRatingFor(entry, line.level) : undefined;
          const cost = adeptPowerUnitCost(entry, line.level);
          return (
            <div className="sheet-card" key={`${line.powerId}-${i}`}>
              <div className="kv-row">
                <span className="kv-value">
                  {entry.name}
                  {level !== undefined ? ` ${level}` : ""}
                </span>
                <span className="hint">{cost} PP</span>
              </div>
              <p className="hint">
                {entry.activation}
                {line.notes ? ` · ${line.notes}` : ""}
              </p>
              <p className="hint">{entry.summary}</p>
            </div>
          );
        })
      )}
    </div>
  );
}

function SkillsTab({ data, effectiveAttrs }: { data: CharacterData; effectiveAttrs: ReturnType<typeof effectiveAttributes> }) {
  const magicEffective = effectiveMagic(data);
  const pools: { skill: string; label: string; usedFor: string }[] = [
    { skill: "Sorcery", label: "Sorcery + Magic", usedFor: "Spellcasting, Counterspelling, Ritual Spellcasting" },
    { skill: "Conjuring", label: "Conjuring + Magic", usedFor: "Summoning, Binding, Banishing spirits (see Spirits tab)" },
    { skill: "Enchanting", label: "Enchanting + Magic", usedFor: "Alchemy, Artificing, Disenchanting - crafting foci/fetishes" },
    { skill: "Astral", label: "Astral + Magic", usedFor: "Assensing, Astral Tracking (see Astral tab)" },
  ];

  return (
    <div>
      <div className="sheet-card">
        <div className="rules-kicker">Linked Attribute</div>
        <div className="kv-row">
          <span className="kv-label">Magic</span>
          <span className="kv-value">{magicEffective}</span>
        </div>
      </div>
      {pools.map((p) => {
        const rank = data.skills[p.skill] ?? 0;
        const specializations = (data.specializations ?? []).filter((s) => s.skill === p.skill);
        return (
          <div className="sheet-card" key={p.skill}>
            <div className="kv-row">
              <span className="kv-label">{p.label}</span>
              <span className="kv-value">{rank + magicEffective}</span>
            </div>
            <p className="hint">
              {p.skill} {rank} + Magic {magicEffective}
            </p>
            <p className="hint">
              Specialization/Expertise:{" "}
              {specializations.length === 0
                ? "none"
                : specializations
                    .map((s) => `${s.focus} +${s.tier === "expertise" ? 3 : 2}${s.tier === "expertise" ? " (Expertise)" : ""}`)
                    .join(", ")}
            </p>
            <p className="hint">{p.usedFor}</p>
          </div>
        );
      })}
      <p className="hint">
        Reaction {effectiveAttrs.reaction} · Intuition {effectiveAttrs.intuition} · Willpower {effectiveAttrs.willpower} -
        shown here since several Magic tests (Astral Initiative, Judge Intentions) lean on them too.
      </p>
    </div>
  );
}

function ReferenceTab() {
  return (
    <div>
      <div className="sheet-card">
        <div className="rules-kicker">Casting a Spell</div>
        <p className="hint">
          1) Adjust the spell (Amp Up: +1 base damage per +2 Drain, Combat spells only; Increase Area: +2m radius
          per +1 Drain). Max adjustments = Magic or Sorcery, whichever is higher.
        </p>
        <p className="hint">2) Roll the Spellcasting test: Sorcery + Magic, vs. the target/threshold in the spell's own writeup.</p>
        <p className="hint">
          3) Deal with Drain: resist the spell's (possibly adjusted) Drain Value with Willpower + Tradition
          Attribute. Hits ≥ DV: no effect. Hits &lt; DV: Stun damage equal to the difference - Physical instead if
          that damage exceeds current Magic. Drain can't be healed by magic or medkits.
        </p>
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Sustaining</div>
        <p className="hint">
          Dropping a sustained spell costs no action - simply stop holding it. While sustaining, take a -2 dice
          pool penalty to any action test per spell sustained (core rulebook p.132). A sustaining focus removes
          this penalty for the one spell it sustains, at the cost of a fixed (non-adjustable) Drain Value.
        </p>
        <p className="hint">
          Limited (L) duration spells can't be sustained past their set endpoint, but carry the same sustaining
          penalty while active. Permanent (P) spells need no sustaining at all once cast.
        </p>
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Spell Categories &amp; Duration</div>
        <p className="hint">Combat, Detection, Health, Illusion, Manipulation.</p>
        <p className="hint">
          I = Instantaneous, S = Sustained, L = Limited, P = Permanent. M = Mana (affects only living/astral
          things), P = Physical (affects the physical world too).
        </p>
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Learning a Spell</div>
        <p className="hint">
          (Sorcery or Enchanting) + Intuition Learning test, needs a formula or teacher and a magical lodge of
          your tradition. Time to learn = 12 days / hits. Spend {KARMA_PER_SPELL} Karma at the end to know it. A
          formula/teacher of a different tradition imposes a -4 penalty.
        </p>
      </div>
    </div>
  );
}

function WorkshopTab({
  data,
  extraKarmaSpent,
  extraNuyenSpent,
}: {
  data: CharacterData;
  extraKarmaSpent: number;
  extraNuyenSpent: number;
}) {
  const karma = karmaRemaining(data, extraKarmaSpent);
  const nuyen = nuyenRemaining(data, extraNuyenSpent);
  const foci = data.gear.filter((l) => l.bondingKarma !== undefined);

  return (
    <div>
      <div className="sheet-card">
        <div className="rules-kicker">Karma &amp; Nuyen</div>
        <div className="kv-row">
          <span className="kv-label">Karma remaining</span>
          <span className="kv-value">{karma}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Nuyen remaining</span>
          <span className="kv-value">{nuyen.toLocaleString()}¥</span>
        </div>
        <p className="hint">
          Matches the totals on the Gear &amp; Lifestyle/Advancement tabs. Read-only here; make changes there.
        </p>
      </div>

      <div className="sheet-card">
        <div className="rules-kicker">Bonded Foci</div>
        {foci.length === 0 ? (
          <p className="hint">No bonded foci.</p>
        ) : (
          foci.map((line, i) => (
            <div className="kv-row" key={`${line.name}-${i}`}>
              <span className="kv-label">
                {line.name}
                {line.rating !== undefined ? ` (Force ${line.rating})` : ""}
              </span>
              <span className="kv-value">{line.bondingKarma} Karma bonded</span>
            </div>
          ))
        )}
        <p className="hint">Read-only here - buy/bond foci on the Gear &amp; Lifestyle tab.</p>
      </div>
    </div>
  );
}
