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
- Search `AI_USAGE.md` first. Use the existing `src/components/animal/` prop-transparent wrappers for matching library components, without a `client:*` directive when static output is sufficient.
- Do not copy React component internals into Astro. Native fallbacks are appropriate for semantic links, content lists, static pagination, and structures not covered by the installed library.
- Buttons that need small DOM handlers can be SSR-rendered library Buttons with `data-*` hooks; a copy-to-clipboard action does not require a hydrated React island.
- ReactNode props such as `Button.icon` must be composed in a `.tsx` SSR component, not passed as Astro markup. Native Astro children remain suitable for ordinary slots.
- Collection schema changes must also update Pages CMS, tracked documentation, tests, and public theme examples. Exclude personal collections from theme exports.
- Extend the existing site composition before inventing a page header: home and archives use a small ribbon label above a normal heading, a shared container, and a blog sidebar. Notes and subscriptions share `src/layouts/BlogContent.astro`; avoid standalone large-icon hero headers for these pages.
- Embedded Markdown entries must override the outer `.prose` article padding while preserving its typography; otherwise a note card inherits a second layer of long-article spacing.

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
