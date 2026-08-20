// Sprite Powers glossary - core rulebook "Technomancers" chapter, "Sprite
// Powers" section, book pp. 194-196 (SR6_Core_RuleBook_noimg.pdf, printed pp.
// 194-195). Every sprite type in sprites.ts references these by id for its
// (always fixed - sprites have no optional-power pool the way spirits do)
// powers; this file explains what each one does, transcribed directly from
// the book (paraphrased for flavor, mechanics/numbers transcribed as
// printed).
//
// Unlike spiritPowers.ts, the book doesn't print a Type/Action/Range/
// Duration header for sprite powers (that legend is specific to the "Wild
// Life" critter/spirit powers pages) - just a name and a paragraph, so this
// entry shape stays simpler than SpiritPowerEntry.

export interface SpritePowerEntry {
  id: string;
  name: string;
  summary: string;
}

export const spritePowers: SpritePowerEntry[] = [
  {
    id: "sprite-power-camouflage",
    name: "Camouflage",
    summary:
      "Conceals a file within another file, invisible to Matrix searches. Concealed files can only be found with a Matrix Perception test specifically looking for the hidden file - even the sprite itself must make this test to find and extract it.",
  },
  {
    id: "sprite-power-cookie",
    name: "Cookie",
    summary:
      "Tags a target persona with a cookie file that tracks the icon's Matrix activities, via a Cracking + Resonance vs. Intuition + Firewall test. The file runs silent, protected at a rating equal to the sprite's level, and logs every host entered and the who/when (not contents) of communications and programs used - net hits benchmark how detailed the log gets (1 hit a bare outline, 4+ a detailed report). At a time the sprite (or its owner) set when placing it, the file transfers itself and its data to the sprite (deleted if the sprite isn't in the Matrix when that happens); the sprite can then hand it to the technomancer. Detectable with a Matrix Perception test on the carrying persona, then removable by stripping its protection and deleting it.",
  },
  {
    id: "sprite-power-diagnostics",
    name: "Diagnostics",
    summary:
      "Evaluates an electronic device's inner workings to assist someone using or repairing it, via an Electronics + Level test - the character gets +1 die per hit to their Electronics/Engineering/Piloting dice pool for that use or repair. Takes the sprite's entire attention; the bonus lasts until the sprite drops it or does something else.",
  },
  {
    id: "sprite-power-electron-storm",
    name: "Electron Storm",
    summary:
      "Engulfs a target persona in a sustained barrage of corrupting datastreams, via a Cracking + Resonance vs. Intuition + Firewall test. On the first successful attack and each subsequent action spent sustaining it, inflicts (Resonance) DV Matrix damage (resisted as normal) and 2 levels of noise on the target. Ends immediately for every electron storm the sprite is sustaining if the sprite itself takes any Matrix damage.",
  },
  {
    id: "sprite-power-hash",
    name: "Hash",
    summary:
      "Temporarily protects a file with a unique Resonance algorithm only the sprite can unprotect. Reverts to normal if the sprite stops carrying it; permanently corrupted (worthless) if the sprite is destroyed while carrying it. Maximum duration (Level x 10) combat rounds.",
  },
  {
    id: "sprite-power-override",
    name: "Override",
    summary:
      "Overrides control of a device on autopilot, via an Electronics + Level vs. Device Rating + Firewall test. On success the sprite gains total control of the device and can substitute its Level for the device's Pilot rating.",
  },
  {
    id: "sprite-power-phantom",
    name: "Phantom",
    summary:
      "Conceals a persona or device, invisible to Matrix searches. Concealed icons can only be found with a Matrix Perception test specifically looking for them - the sprite can instead make an Electronics + Resonance test, with its net hits setting the threshold for that Matrix Perception test.",
  },
  {
    id: "sprite-power-stability",
    name: "Stability",
    summary:
      "Usable on any persona or device the sprite has User or Admin access to. Prevents normal malfunctions or accidents from affecting the target, including standard glitches and those induced by Gremlins or the Accident power - ignore standard glitches and reduce critical glitches to regular glitches.",
  },
  {
    id: "sprite-power-suppression",
    name: "Suppression",
    summary:
      "If the sprite is in a host using this power when the host launches IC, that IC's launch is delayed by (Level / 2) combat rounds. Delayed IC can't act or be targeted.",
  },
  {
    id: "sprite-power-trap",
    name: "Trap",
    summary:
      "Locks down a target, preventing it from taking an action, via a Cracking + Level vs. Willpower + Firewall test - success means the target can't act as long as the power is sustained. Takes the sprite's entire attention; the target can act again once the sprite does something else.",
  },
  {
    id: "sprite-power-watermark",
    name: "Watermark",
    summary:
      "Tags an icon with an invisible marking only Resonance-driven entities can see (like a Matrix signature), letting the sprite secretly leave messages on Matrix objects. A sprite can overwrite an existing watermark with a new one. Erasable with the Erase Matrix Signature action by a Resonant being; otherwise lasts as long as the icon does.",
  },
];
