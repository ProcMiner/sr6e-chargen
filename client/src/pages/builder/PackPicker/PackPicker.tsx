import type { CharacterData } from "../../../character";
import type { GearRulesResponse, LifestyleRulesResponse, PackCatalogEntry, PackRulesResponse } from "../../../rules";
import { nuyenRemaining } from "../../../deriveGear";
import { canAffordPack, explodePackToGearLines, packLifestyleLine } from "../../../derivePacks";

interface Props {
  packRules: PackRulesResponse;
  gearRules: GearRulesResponse;
  lifestyleRules: LifestyleRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
  /** Nuyen already committed outside gear (e.g. lifestyle purchases - see deriveLifestyle.ts), so this picker's afford checks reflect the whole shared nuyen pool. */
  extraNuyenSpent?: number;
}

export function PackPicker({ packRules, gearRules, lifestyleRules, data, onChange, extraNuyenSpent = 0 }: Props) {
  const remaining = nuyenRemaining(data, extraNuyenSpent);

  const bySubcategory = new Map<string, PackCatalogEntry[]>();
  for (const pack of packRules.packs) {
    const key = pack.subcategory ?? "Other";
    if (!bySubcategory.has(key)) bySubcategory.set(key, []);
    bySubcategory.get(key)!.push(pack);
  }

  function buyPack(pack: PackCatalogEntry) {
    if (!canAffordPack(pack, remaining)) return;
    const newLines = explodePackToGearLines(pack, gearRules.gear, packRules.packs);
    const lifestyleLine = packLifestyleLine(pack, packRules.packs, lifestyleRules.lifestyles);
    onChange({
      ...data,
      gear: [...data.gear, ...newLines],
      lifestyles: lifestyleLine ? [...data.lifestyles, lifestyleLine] : data.lifestyles,
    });
  }

  if (packRules.packs.length === 0) return null;

  return (
    <div className="pack-picker">
      <h2>PACKs</h2>
      <p className="hint">
        Pre-assembled gear bundles at a flat price. Buying one adds each item as its own line in Gear
        (below), so it stays individually editable and removable afterward.
      </p>

      {[...bySubcategory.entries()].map(([subcategory, entries]) => (
        <details key={subcategory} className="quality-section">
          <summary>{subcategory}</summary>
          <div className="module-picker">
            {entries.map((pack) => (
              <button
                key={pack.id}
                className="chip"
                disabled={!canAffordPack(pack, remaining)}
                onClick={() => buyPack(pack)}
                title={pack.summary}
              >
                {pack.name} ({pack.cost.toLocaleString()}¥)
              </button>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
