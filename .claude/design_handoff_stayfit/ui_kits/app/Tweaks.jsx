/* StayFit UI Kit — Tweaks panel.
   Three expressive controls that reshape the FEEL of the journal screen.
   None of them are property-level pixel pushes; each one shifts the
   atmosphere as a whole. */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mood": "wellness",     // "wellness" (warm cream + terracotta) | "volt" (gym dark + lime)
  "density": "spacious",  // "spacious"  | "compact"
  "macros": "bars"        // "bars" | "donuts" | "numbers"
}/*EDITMODE-END*/;

function StayFitTweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Mood"/>
      <TweakRadio label="Identity" value={tweaks.mood}
        options={[{ value: "wellness", label: "Wellness" }, { value: "volt", label: "Volt" }]}
        onChange={(v) => setTweak("mood", v)}/>

      <TweakSection label="Layout"/>
      <TweakRadio label="Density" value={tweaks.density}
        options={[{ value: "spacious", label: "Spacious" }, { value: "compact", label: "Compact" }]}
        onChange={(v) => setTweak("density", v)}/>

      <TweakSection label="Macros"/>
      <TweakRadio label="Display" value={tweaks.macros}
        options={[
          { value: "bars",    label: "Bars" },
          { value: "donuts",  label: "Donuts" },
          { value: "numbers", label: "Numbers" },
        ]}
        onChange={(v) => setTweak("macros", v)}/>
    </TweaksPanel>
  );
}

Object.assign(window, { TWEAK_DEFAULTS, StayFitTweaks });
