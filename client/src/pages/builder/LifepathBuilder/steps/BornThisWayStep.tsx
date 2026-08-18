import type { CharacterData, LifepathSystemState } from "../../../../character";
import type { LifepathRulesResponse, MetatypeAttributes, MetavariantCatalogEntry } from "../../../../rules";
import { effectiveMetatypeInfo, findMetavariant } from "../../../../deriveMetavariant";
import { AWAKENED_TYPES, deriveLifepathState, magicResonancePresence, recomputeLifepathData } from "../../../../deriveLifepath";
import { LivingPersonaPanel } from "../../LivingPersonaPanel/LivingPersonaPanel";

interface Props {
  rules: LifepathRulesResponse;
  metatypeAttributes: MetatypeAttributes[];
  metavariants: MetavariantCatalogEntry[];
  skillList: string[];
  data: CharacterData;
  onChange: (data: CharacterData) => void;
}

export function BornThisWayStep({ rules, metatypeAttributes, metavariants, skillList, data, onChange }: Props) {
  const state = deriveLifepathState(data);
  const { hasMagic } = magicResonancePresence(state.awakenedType);

  const metatypeInfo = effectiveMetatypeInfo(data, metatypeAttributes, metavariants);
  const selectedMetavariant = findMetavariant(data, metavariants);
  const availableMetavariants = metavariants.filter((m) => m.parentMetatype === data.metatype);

  function recompute(
    nextState: LifepathSystemState,
    metatype: string | undefined = data.metatype,
    metavariantId: string | undefined = data.metavariant
  ) {
    onChange(recomputeLifepathData(data, rules, metatypeAttributes, metavariants, skillList, nextState, metatype, metavariantId));
  }

  function applyMetatype(metatype: string) {
    recompute(state, metatype, undefined);
  }

  function applyMetavariant(metavariantId: string | undefined) {
    recompute(state, data.metatype, metavariantId);
  }

  function applyAwakenedType(type: string) {
    recompute({ ...state, awakenedType: type });
  }

  return (
    <div className="lifepath-builder">
      <h2>Born This Way</h2>
      <div className="chip-row">
        {metatypeAttributes.map((m) => (
          <button
            key={m.metatype}
            className={data.metatype === m.metatype ? "chip selected" : "chip"}
            onClick={() => applyMetatype(m.metatype)}
          >
            {m.metatype}
          </button>
        ))}
      </div>
      {availableMetavariants.length > 0 && (
        <>
          <h3>Metavariant (optional)</h3>
          <p className="hint">
            Overrides attribute ranges; its Karma cost is deducted from your customization Karma pool
            (see Resources/Karma on the summary sheet).
          </p>
          <div className="chip-row">
            <button
              className={!data.metavariant ? "chip selected" : "chip"}
              onClick={() => applyMetavariant(undefined)}
            >
              Base {data.metatype}
            </button>
            {availableMetavariants.map((m) => (
              <button
                key={m.id}
                className={data.metavariant === m.id ? "chip selected" : "chip"}
                onClick={() => applyMetavariant(m.id)}
                title={m.racialTraits.join(", ")}
              >
                {m.name} ({m.karma} Karma)
              </button>
            ))}
          </div>
          {selectedMetavariant?.karmaNote && <p className="hint">{selectedMetavariant.karmaNote}</p>}
        </>
      )}
      {metatypeInfo && (
        <>
          <div className="chip-row">
            {AWAKENED_TYPES.map((t) => (
              <button
                key={t}
                className={state.awakenedType === t ? "chip selected" : "chip"}
                onClick={() => applyAwakenedType(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="hint">
            Attributes with a racial max above 6 start at 2; everything else starts at 1. Choose 1-2
            inborn qualities in the Qualities section below, and your Native Language in Finishing Steps.
          </p>
          {hasMagic && (
            <>
              <h4>Tradition Attribute</h4>
              <p className="hint">
                Pairs with Magic for Astral Combat's Attack Rating and Drain resistance (core rulebook
                p.160-161) - Logic for a hermetic-style tradition, Charisma for a shamanic-style one.
                Mystic Adepts can never astrally project (p.158), even with this chosen.
              </p>
              <div className="chip-row">
                {(["logic", "charisma"] as const).map((attr) => (
                  <button
                    key={attr}
                    className={data.traditionAttribute === attr ? "chip selected" : "chip"}
                    onClick={() => onChange({ ...data, traditionAttribute: attr })}
                  >
                    {attr === "logic" ? "Logic" : "Charisma"}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <LivingPersonaPanel data={data} onChange={onChange} />
    </div>
  );
}
