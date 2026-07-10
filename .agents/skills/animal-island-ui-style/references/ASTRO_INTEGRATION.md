# Astro integration notes

This repository-local note adapts the upstream React-oriented design skill for a long-running Astro blog.

## Default architecture

1. Prefer `.astro` components and scoped/global CSS for static blog UI.
2. Use Content Collections for posts and type their frontmatter schema.
3. Add `@astrojs/react` only when an interactive component benefits from the upstream React library.
4. Hydrate React components with the narrowest directive that works:
   - no `client:*` for server-renderable static output;
   - `client:visible` for below-the-fold widgets;
   - `client:idle` for noncritical interaction;
   - `client:load` only for immediately interactive controls.
5. Import `animal-island-ui/style` once from a shared layout or global entry when the npm package is used.

## Visual implementation strategy

- Treat the tokens and hard visual rules in `../SKILL.md` as the source of truth.
- Place project tokens in `src/styles/tokens.css` as CSS custom properties so Astro and React components share them.
- Keep article prose readable: use the full playful visual language for navigation, cards, tags, callouts, buttons, and decorative elements; use restrained motion and generous line height in post bodies.
- Preserve keyboard focus, semantic HTML, reduced-motion behavior, and color contrast while translating exact upstream styles.
- Do not copy React component internals into Astro unless needed. Reproduce static structures with semantic Astro markup and CSS; wrap existing React components only when their behavior saves meaningful maintenance.

## Suggested project layout

```text
src/
  components/
    island/        # Astro-native themed components
    react/         # Interactive React islands only
  content/
    blog/
  layouts/
  pages/
  styles/
    global.css
    tokens.css
```

## Package integration (when requested)

```sh
npx astro add react
npm install animal-island-ui classnames
```

```astro
---
import BlogActions from '../components/react/BlogActions.tsx';
import 'animal-island-ui/style';
---

<BlogActions client:visible />
```

Before writing component props, consult `AI_USAGE.md`; do not infer undocumented APIs.
