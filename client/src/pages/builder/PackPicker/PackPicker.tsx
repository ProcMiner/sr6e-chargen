import type { CharacterData } from "../../../character";
import type { GearRulesResponse, PackCatalogEntry, PackRulesResponse } from "../../../rules";
import { nuyenRemaining } from "../../../deriveGear";
import { canAffordPack, explodePackToGearLines } from "../../../derivePacks";

interface Props {
  packRules: PackRulesResponse;
  gearRules: GearRulesResponse;
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function PackPicker({ packRules, gearRules, data, onChange }: Props) {
  const remaining = nuyenRemaining(data);

  const bySubcategory = new Map<string, PackCatalogEntry[]>();
  for (const pack of packRules.packs) {
    const key = pack.subcategory ?? "Other";
    if (!bySubcategory.has(key)) bySubcategory.set(key, []);
    bySubcategory.get(key)!.push(pack);
  }

  function buyPack(pack: PackCatalogEntry) {
    if (!canAffordPack(pack, remaining)) return;
    const newLines = explodePackToGearLines(pack, gearRules.gear);
    onChange({ ...data, gear: [...data.gear, ...newLines] });
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
