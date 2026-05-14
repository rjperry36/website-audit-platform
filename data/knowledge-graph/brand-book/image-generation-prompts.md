# Image Generation Prompts — Aurelune

A library of ready-to-paste prompts for ChatGPT, Midjourney, FLUX and DALL-E. Built directly from the brand rules in `visual-identity.md`, `imagery-specs.md` and the four persona files, so anything generated from these prompts is brand-compliant by construction.

> **For the future Creative Director agent:** every prompt in this file should be retrievable from the knowledge graph. `BrandAsset` nodes carry `generation_prompt` and `negative_prompt` properties (added to `schema.json` as part of this PR) so the agent can query: _"Give me the prompt for `brand-asset:lifestyle-pm-bedside` in market `JP`"_ and return a model-ready string.

---

## How to use this file

1. **Start every session with the "Creative Director system prompt"** below. Paste it once at the top of your image-gen conversation, before any specific image request. It locks the brand DNA.
2. **Then paste the specific scene prompt** for the image you want.
3. **For per-market variants**, append the variant block.
4. **Optionally append the model-specific block** (Midjourney parameters / FLUX style cues / DALL-E format hints) at the very end of the prompt.

If you only have one shot at the prompt (e.g. an embedded image-gen call inside an automation), concatenate: `system + scene + variant + model_hints`.

---

## Part A — Creative Director system prompt

> Paste this at the start of every image-gen session.

```
You are generating photography for Aurelune, a prestige skincare brand. Every
image must follow these rules:

POSITIONING
Aurelune is "skincare in sync" — formulas designed around the skin's circadian
rhythm. Two phases: AM (morning, dawn-warm) and PM (evening, dusk-cool). The
imagery feels confident, evidence-led, quietly luxurious. Never aspirational
lifestyle, never theatrical, never hyped.

PHOTOGRAPHY RULES
- Photorealistic, editorial. Sony A7 IV / Hasselblad H6D feel.
- Single soft light source at approximately 45 degrees. Soft shadows only.
- 50mm prime for product, 35mm for environment, 100mm macro for textures.
- f/2.8 to f/4.0. Shallow but legible depth of field.
- ISO 200. Natural grain, no plastic post-processing.
- Backgrounds: bone (#F2EDE4) OR ink (#1B1B1F) OR a real domestic setting.
- No Photoshop on skin. No retouching beyond colour balance and dust removal.
- Diverse skin tones, ages 25-58, and gender expressions when people appear.
- Domestic, lived-in settings — a real bathroom shelf, a bedside table, a
  window sill. Aspirational but believable, not pristine.

COMPOSITION
- Generous whitespace. Asymmetric balance preferred over centred symmetry.
- One clear subject. One idea per frame.
- Restrained product staging — at most three products in a single frame.

PALETTE (hex)
- Ink     #1B1B1F   (deep cool near-black)
- Bone    #F2EDE4   (warm off-white)
- Dawn    #E8C9A3   (warm peach — AM accent)
- Dusk    #5C5A7A   (muted indigo — PM accent)
- Signal  #C84F2A   (rust — used sparingly, CTAs only)
- Mist    #D8D5CE   (quiet utility grey)

NEGATIVE — things that must NEVER appear
- Gold foil. Cursive script type. Stock-photography feel. Glitter. Sparkle.
- A model holding the product up to their face.
- Hands gripping a bottle vertically in front of a smiling face.
- Multiple products lined up in a row like a store display.
- Bright saturated colours outside the palette.
- "Glowing skin" with unrealistic highlights.
- Lab-coat / clinical / pharmaceutical aesthetic.
- Yachts, cashmere, marble mansions, "aspirational lifestyle" stock cues.
- Cluttered backgrounds, multiple competing focal points.
- Watermarks, logos other than Aurelune's, brand-name visible signage.
- Exclamation marks, sale stickers, "NEW" badges burned into the image.

OUTPUT
- Aspect ratios used by Aurelune: 1:1, 4:5, 16:9, 9:16. Specify per-image.
- Resolution at least 2048px on the longest edge.
```

---

## Part B — Scene prompts

### Lifestyle — AM bathroom shelf (hero)

```
A real bathroom shelf at first light. Wide window to camera right is the only
light source, casting a soft warm sideways beam. Three Aurelune skincare
bottles in restrained ceramic-style packaging sit on a bone-coloured marble
shelf (#F2EDE4). Beside them: a single white ceramic mug, a half-full water
glass, a small folded linen cloth in mist grey. The mirror behind is slightly
foggy at the bottom edge. Generous whitespace on the right two-thirds of the
frame. No people, no hands. Editorial calm. Slightly imperfect — not staged.

Aspect ratio: 16:9 (horizontal hero) or 4:5 (social).
```

### Lifestyle — PM bedside (hero)

```
A real bedside table at dusk. A single warm-toned bedside lamp (dusk
indigo #5C5A7A lampshade, warm bulb) is the only light source. Two Aurelune
bottles sit beside a paperback book lying face-down, spine creased — clearly
mid-read. A small water glass. A linen-covered duvet edge visible at the
bottom of the frame. The room behind softly out of focus, deep ink-tone
shadows (#1B1B1F). Lamp glow falls across the bottles, creating quiet
contrast. No people. Bedtime, but not styled — believable.

Aspect ratio: 16:9 or 9:16 (vertical for OOH / story).
```

### Lifestyle — Hands applying serum

```
Macro close-up of two hands belonging to an adult aged roughly 35-50. One hand
holds a glass serum bottle with a dropper, the other receives a single bead
of clear serum on the back of the index finger. Skin is real, unretouched —
some texture, fine lines visible, natural and confident. Skin tone: [specify
per market — see variants]. Background: bone (#F2EDE4) or soft out-of-focus
domestic warmth. Single soft light from upper left. Crisp focus on the
fingertip and the bead of serum. No face visible. No nail polish. No jewellery
except a single thin band.

Aspect ratio: 4:5 (PDP) or 1:1 (social).
```

### Lifestyle — Bathroom counter mid-routine

```
A real bathroom counter mid-routine. Slightly messy in a believable way: a
single Aurelune bottle with its cap off lying flat next to it, a used cotton
pad folded, a half-empty water glass with a fingerprint visible, a discarded
hair tie. Ceramic basin, mid-century tile in cool greys (#D8D5CE). A single
shaft of morning light enters from camera left. The frame catches a moment
mid-routine — not before, not after. No people in shot. Editorial reportage
feel, not staged still-life.

Aspect ratio: 16:9 or 1:1.
```

### Lifestyle — Window-light meditation

```
A single Aurelune bottle on a windowsill, late afternoon. Light is warm and
sideways, casting a long quiet shadow across pale wood. Through the window,
a softly out-of-focus glimpse of leaves or sky — never urban. A single linen
cloth folded beside the bottle. The mood is contemplative, almost still-life
painting. No people. Light should feel like 4-5pm in summer.

Aspect ratio: 16:9 (OOH-adjacent, ECRM header).
```

### Product — Hero packshot on bone

```
Studio packshot of a single Aurelune skincare bottle on a bone background
(#F2EDE4). The bottle is shot at a slight 3/4 angle, with restrained
embossed-style branding (the Aurelune wordmark and crescent mark visible but
not exaggerated). Single soft light source from camera upper-left at 45°.
Long soft shadow falls to lower-right. No reflections, no plastic shine — a
matte ceramic-like finish. Generous whitespace top and right. No props.

Aspect ratio: 1:1.
```

### Product — Hero packshot on ink

```
Studio packshot of a single Aurelune skincare bottle on a deep ink background
(#1B1B1F). The bottle is shot at a slight 3/4 angle. The Aurelune mark catches
a quiet highlight from a single soft light source at 45° from camera left.
The bottle itself is a tone or two warmer than the background, so it sits
forward. Long soft shadow falls behind. Minimal — no props, no reflections.

Aspect ratio: 1:1.
```

### Product — Texture macro

```
Macro shot of skincare product texture itself — a single, thumbnail-sized
pool of serum, cream or balm on a clean ceramic surface in bone or ink. Single
soft light from upper left catches the meniscus of the texture. The texture
is photographed honestly: a serum has a fluid edge, a cream has a soft peak,
a balm has visible warmth-pooling. No swirling, no perfect dollops. 100mm
macro lens feel, f/4 focus on the front edge of the texture.

Aspect ratio: 1:1.
```

### Ingredient — Macro illustration

```
A macro photograph of [INGREDIENT — e.g. encapsulated retinaldehyde,
bakuchiol, niacinamide, plant peptides, oat ceramides] presented honestly —
its raw or formulated state. Single soft light source. Ink background
(#1B1B1F). Restrained scientific feel without lab-coat tropes — no test tubes,
no white-gloved hands, no microscope cliché. A single small element, sharply
focused. The image should feel quietly evidential, not decorative.

Aspect ratio: 1:1.
```

---

## Part C — Per-market variant blocks

> Append to the relevant scene prompt above.

### JP variant — AM bathroom shelf

```
Variant for the Japanese market: replace marble shelf with smooth pale ash
wood. Ceramic mug → small yunomi-style cup in muted indigo. Water glass →
off-white. Window framing visible at the edge has thin wooden mullions.
Overall light slightly cooler. Maintain everything else from the base prompt.
```

### FR variant — PM bedside

```
Variant for the French market: linen sheets visible at the bottom of the
frame, with a softly rumpled edge. The paperback is a French paperback (small,
softcover, thin spine). Brass lamp with a parchment shade in warm bone. The
mood is slightly more romantic, slightly less minimal.
```

### DE variant — Bathroom counter mid-routine

```
Variant for the German market: mid-century tile in cooler greys with cleaner
grout lines. White ceramic, fewer warm tones, slightly more architectural.
Less mess — still believable, but the room feels more deliberately ordered.
```

### CN variant — Hands applying serum

```
Variant for the Chinese market: skin tone slightly cooler and lighter, hand
model with Chinese features. Product unchanged. Background remains bone or
soft out-of-focus warmth. Everything else from base prompt holds.
```

### Generic skin-tone variant rotation

When generating multiple versions of the hands-applying or any human-element
scene for global use, rotate skin tones across these reference values to
ensure diversity. Each version is its own image — never composite or "fix"
in post.

```
- Fitzpatrick I-II: cool fair, freckled, light pink undertones
- Fitzpatrick III: warm light, golden undertones
- Fitzpatrick IV: warm mid, olive undertones
- Fitzpatrick V: warm deep, rich brown undertones
- Fitzpatrick VI: deep, cool brown undertones, blue-black
```

---

## Part D — Model-specific hints

> Append at the end of the prompt. Use the block for the model you're querying.

### ChatGPT (image gen)

```
Render this as a photograph in a photorealistic editorial style. Avoid
illustrated or painterly feel. Avoid AI-detection tells (over-smooth skin,
plastic textures, symmetrical eyes, six fingers). Respect the negative list
above.
```

### Midjourney v6+

```
--ar [aspect_ratio]  --style raw  --stylize 150  --v 6
```

Use `--no` to enforce the negatives, e.g.:

```
--no logo, watermark, text, glitter, gold, cursive, model holding product,
sale sticker, exclamation
```

### FLUX (1.1 Pro / similar)

FLUX responds well to long descriptive prompts. Keep the system prompt
verbose and trust the model to honour the negative list rather than relying
on explicit negative prompting.

Aspect ratio: pass via API parameter, not in prompt text.

### DALL-E 3 / Sora frames

DALL-E rewrites prompts internally. Keep the system prompt above, but be
prepared to iterate — DALL-E sometimes drops elements (e.g. the second
product in a three-product scene). If a scene needs to be exact, generate
one element at a time and composite.

---

## Part E — Hardening the prompt for the agent

When the Creative Director agent generates an image, it should:

1. Pull the brand-DNA system prompt from this file (or, in future, from the `BrandGuideline` node `brand-guideline:visual-identity` and the `Persona` node it's serving).
2. Pull the scene-specific prompt for the requested `BrandAsset`.
3. Append the appropriate market variant if `market_id` is set on the request.
4. Append the model-specific hints for the configured image-gen backend.
5. Log the final composite prompt against the resulting `BrandAsset` so we can audit "why did the agent produce this?".

The audit trail is the bit that makes this trustworthy — every image carries the prompt that produced it, the brand-rules version it was rendered against, and the persona/market it was intended for.
