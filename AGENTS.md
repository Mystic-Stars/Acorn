# Acorn development guidance

Acorn is intended to become a long-running Astro blog.

## UI direction

- Use the repository-local `animal-island-ui-style` skill for visual design and themed UI work.
- For Astro-specific decisions, follow `.agents/skills/animal-island-ui-style/references/ASTRO_INTEGRATION.md`.
- Before implementing UI, search `.agents/skills/animal-island-ui-style/references/AI_USAGE.md` for a matching component and use the documented package API when one exists.
- Only when the component library has no suitable semantic component, implement an Astro-native fallback using `.agents/skills/animal-island-ui-style/references/DESIGN_PROMPT.md`.
- Import `animal-island-ui/style` once from the shared layout; do not repeat the global style import in individual components.
- Prefer Astro-native components for static content and small React islands only for meaningful client interaction.
- Preserve the upstream Animal Island design tokens and accessibility rules; do not invent undocumented `animal-island-ui` component props.

## Long-term maintainability

- Keep content, layouts, components, and design tokens separated.
- Treat `src/config/` as the source of truth for editable site content and UI behavior; do not duplicate configurable values in page components.
- Treat `src/content.config.ts` as the source of truth for blog frontmatter and keep `docs/CONFIGURATION.md` synchronized with schema changes.
- Avoid broad client-side hydration; choose the narrowest `client:*` directive.
- Add tests and documentation alongside durable features.
- Do not commit generated build output, dependency directories, secrets, or local environment files.
