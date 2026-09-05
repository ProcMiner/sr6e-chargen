// Gear & Lifestyle tab additions (SR6 Character Sheet Design handoff) - the
// read-only Lifestyles/Nuyen/Karma summary and Vehicles list that sit
// alongside the existing GearPicker (which already owns the full Gear
// table + purchase UI, so it isn't duplicated here).
import type { CharacterData } from "../../character";
import { bucketGear, karmaRemaining, nuyenRemaining } from "../../deriveGear";
import { lifestyleCostTotal } from "../../deriveLifestyle";
import { startingKarma } from "../../derivePriorityVariant";
import type { GearRulesResponse } from "../../rules";

interface Props {
  data: CharacterData;
  gearRules: GearRulesResponse;
  extraKarmaSpent: number;
  extraNuyenSpent: number;
}

export function GearLifestyle({ data, gearRules, extraKarmaSpent, extraNuyenSpent }: Props) {
  const bucketed = bucketGear(data, gearRules.gear);
  const lifestyleSpend = lifestyleCostTotal(data.lifestyles);
  const nuyenLeft = nuyenRemaining(data, extraNuyenSpent + lifestyleSpend);
  const karmaLeft = karmaRemaining(data, extraKarmaSpent);
  const karmaTotal = startingKarma(data);

  return (
    <div className="rules-two-col">
      <div className="sheet-card">
        <div className="rules-kicker">Lifestyles / Nuyen / Karma</div>
        {data.lifestyles.length > 0 ? (
          data.lifestyles.map((line, i) => (
            <div className="kv-row" key={i}>
              <span className="kv-label">
                {line.name} ({line.monthsPrepaid} mo. prepaid)
              </span>
              <span className="kv-value">¥{line.costPerMonth.toLocaleString()}/mo</span>
            </div>
          ))
        ) : (
          <p className="hint">No lifestyle purchased.</p>
        )}
        <div className="kv-row">
          <span className="kv-label">Nuyen (available)</span>
          <span className="kv-value">¥{nuyenLeft.toLocaleString()}</span>
        </div>
        <div className="kv-row">
          <span className="kv-label">Karma (total / available)</span>
          <span className="kv-value">
            {karmaTotal.toLocaleString()} / {karmaLeft.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="sheet-card">
        <div className="rules-kicker">Vehicles</div>
        {bucketed.vehicles.length > 0 || bucketed.drones.length > 0 ? (
          <>
            {bucketed.vehicles.map(({ line, entry }, i) => (
              <div key={i} className="vehicle-row">
                <div className="vehicle-row-name">
                  {line.name}
                  {line.qty > 1 ? ` x${line.qty}` : ""}
                </div>
                {entry?.stats && (
                  <div className="hint">
                    {Object.entries(entry.stats)
                      .map(([k, v]) => `${k} ${v}`)
                      .join(" · ")}
                  </div>
                )}
              </div>
            ))}
            {bucketed.drones.length > 0 && (
              <div className="kv-row">
                <span className="kv-label">Drones</span>
                <span className="kv-value">{bucketed.drones.map(({ line }) => `${line.name} x${line.qty}`).join(", ")}</span>
              </div>
            )}
          </>
        ) : (
          <p className="hint">No vehicles owned.</p>
        )}
      </div>
    </div>
  );
}
