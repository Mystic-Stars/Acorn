---
name: animal-island-ui-style
description: >
  Use the animal-island-ui visual language to create or review React and Astro interfaces,
  components, layouts, and long-running blog features. Trigger for Animal Crossing-inspired,
  Animal Island, warm natural, rounded cute UI; use of the animal-island-ui React package;
  Astro integration through React islands or Astro-native CSS; and faithful extension of the
  upstream design tokens, component APIs, interaction rules, accessibility, or motion language.
---

# Animal Island UI style

Apply the upstream Animal Island design language without inventing component APIs or turning an Astro site into a fully hydrated React app.

## Choose the implementation path

1. For Astro blogs, read `references/ASTRO_INTEGRATION.md` first.
2. Prefer Astro-native markup and CSS for static navigation, article layouts, cards, tags, callouts, and decoration.
3. Use `@astrojs/react` and `animal-island-ui` only when an interactive React island provides meaningful value.
4. When using library components, consult `references/AI_USAGE.md` before writing props, imports, or controlled-state logic.
5. When recreating or extending visuals, consult the relevant section of `references/UPSTREAM_STYLE_GUIDE.md` and enforce `references/UPSTREAM_CURSORS_RULES.md` section 7.3.
6. Use `references/DESIGN_PROMPT.md` only when preparing prompts for external visual-generation tools.

## Core visual contract

- Use warm earth tones, cream/parchment surfaces, mint accents, warm brown text, large rounded or pill silhouettes, and warm shadows.
- Never use pure black text, cold gray page backgrounds, cold blue focus rings, thin font weights, or square interactive controls.
- Reserve thick game-key 3D shadows for primary and danger-primary buttons. Keep default buttons subtle, inputs shadowless by default, switches without outer handle shadows, and cards without box shadows.
- Use Nunito for Latin text and Noto Sans SC for Chinese text. Keep body weight at 500, controls and headings at 600–700, and numeric emphasis at 900.
- Preserve semantic HTML, keyboard behavior, visible focus, reduced-motion support, readable article typography, and color contrast.
- Keep decorative motion restrained in long-form reading surfaces.

## Reference search strategy

The bundled upstream references are large. Search narrowly before reading:

- Component API: search `references/AI_USAGE.md` for `## <Component>` or the prop name.
- Pixel styling: search `references/UPSTREAM_STYLE_GUIDE.md` for `### <Component>`, `Design Tokens`, `Demo`, or the CSS property.
- Hard prohibitions: search `references/UPSTREAM_CURSORS_RULES.md` for `7.3`, `禁止`, or the component name.
- External prompts: search `references/DESIGN_PROMPT.md` for the target tool or visual element.

## Astro defaults

- Put shared CSS custom properties in `src/styles/tokens.css` and global foundations in `src/styles/global.css`.
- Keep static themed components under `src/components/island/` and interactive React islands under `src/components/react/`.
- Import `animal-island-ui/style` once from a shared entry when the npm package is used.
- Apply the narrowest hydration directive: no directive for static output, then prefer `client:visible` or `client:idle`; use `client:load` only for immediate interaction.
- Keep Content Collections, layouts, UI components, and design tokens separated for long-term maintenance.

## Provenance

Read `references/PROVENANCE.md` for the pinned upstream source and license. Preserve attribution when redistributing derived material.
