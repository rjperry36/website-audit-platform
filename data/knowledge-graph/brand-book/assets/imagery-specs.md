# Imagery Specs

Detailed briefs for each product and lifestyle image referenced by `BrandAsset` nodes. Actual photography is generated separately and dropped into `assets/.placeholders/` under the filename listed. KG nodes already reference these paths.

## Standards

- **Format:** PNG (web), TIFF (print archive)
- **Aspect ratios:** 1:1 (PDP hero), 4:5 (social), 16:9 (editorial / OOH widescreen), 9:16 (vertical OOH / story)
- **Resolution:** 3000 × 3000 px minimum for hero shots; 1500 × 1875 px minimum for social
- **Colour space:** sRGB for web, Adobe RGB for print
- **Backgrounds:** `#1B1B1F` (ink), `#F2EDE4` (bone), or environmental natural-light scene
- **Light:** single soft light source, ~45°, no hard shadows
- **No people in product shots.** Lifestyle shots may include people per the rules in `visual-identity.md`.

## Product shots

For every product in `nodes/products.json`, the following angles are required:

| Filename pattern | Description | Aspect |
|---|---|---|
| `product-{sku}-hero-bone.png` | Hero packshot on bone background, slight 3/4 angle | 1:1 |
| `product-{sku}-hero-ink.png` | Hero packshot on ink background, slight 3/4 angle | 1:1 |
| `product-{sku}-side.png` | Pure side profile, bone background | 1:1 |
| `product-{sku}-cap-detail.png` | Macro of the cap and emboss | 4:5 |
| `product-{sku}-texture.png` | Macro of the product texture itself (cream, serum, balm) on a clean surface | 1:1 |

## Lifestyle scenes

Each scene is a single environment shot suitable for social, ECRM and editorial. No models holding products to their face.

| Filename | Scene | Notes |
|---|---|---|
| `lifestyle-am-bathroom-shelf.png` | An AM-routine bathroom shelf at first light. Light streaming sideways. Three products visible, one cup of water, one ceramic mug. No people. | Hero AM image |
| `lifestyle-pm-bedside.png` | A PM-routine bedside table at dusk. Warm lamp, two products, a book face-down, a glass of water. No people. | Hero PM image |
| `lifestyle-hands-applying.png` | Two hands, one applying serum to a fingertip. Close crop, no face. Skin tone diverse — rotate per market. | Used on PDPs |
| `lifestyle-bathroom-counter-busy.png` | A real (slightly messy) bathroom counter with the product mid-routine. Aspirational but not staged. | Editorial / social |
| `lifestyle-window-light.png` | Product on a windowsill, late afternoon. No people. | OOH-adjacent, ECRM headers |

## Per-market lifestyle variants

For markets where the lifestyle scene's cultural cues should adapt, produce a variant:

| Market | Variant of | Adapt |
|---|---|---|
| `JP` | `lifestyle-am-bathroom-shelf` | Tatami-adjacent surface, ceramic mug → yunomi, water glass off-white |
| `FR` | `lifestyle-pm-bedside` | Linen sheet visible, French paperback, brass lamp |
| `DE` | `lifestyle-bathroom-counter-busy` | Mid-century tile, white ceramic, minimal warmth |
| `CN` | `lifestyle-hands-applying` | Hand model with Chinese skin tone; product unchanged |

## Ingredient illustrations

For each Tier-A claim ingredient (encapsulated retinaldehyde, bakuchiol, niacinamide, plant peptides, oat ceramides), produce a single hero illustration:

| Filename pattern | Style |
|---|---|
| `ingredient-{slug}-macro.png` | Photographic macro of the raw or formulated ingredient, single light source, ink background |
| `ingredient-{slug}-diagram.svg` | Restrained scientific diagram, single colour (`aurelune.ink`), explaining mechanism in 1 image |

## Social and OOH templates

Reusable design templates, not photography. These live as SVG and are referenced as `BrandAsset` nodes of `asset_type: social_template` or `ooh_template`.

| Filename | Purpose |
|---|---|
| `template-social-science-carousel.svg` | 8-slide carousel structure |
| `template-social-routine-of.svg` | Real-customer routine post |
| `template-ooh-48-sheet.svg` | 48-sheet billboard layout |
| `template-ooh-6-sheet.svg` | 6-sheet street poster |
| `template-ooh-digital-loop.svg` | Digital OOH 3-frame loop |
