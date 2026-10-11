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
- Treat `src/content.config.ts` as the source of truth for blog frontmatter and keep the tracked README and CMS configuration synchronized with schema changes. Update local `docs/CONFIGURATION.md` as well when available.
- Avoid broad client-side hydration; choose the narrowest `client:*` directive.
- Add tests and documentation alongside durable features.
- Do not commit generated build output, dependency directories, secrets, or local environment files.

## Directory conventions

- Follow the directory map in the tracked README and module README files when adding or moving files; use local `docs/PROJECT_STRUCTURE.md` for additional guidance when available.
- Group Astro components under `src/components/site/`, `blog/`, or the relevant `island/` subdirectory; group interactive React islands by feature under `src/components/react/`.
- Keep build-time plugins in `src/plugins/` and repository maintenance commands in `scripts/`.
- Put pure logic tests in `tests/unit/`, DOM/filesystem tests in `tests/integration/`, production output checks in `tests/build/`, and reusable test utilities in `tests/helpers/`.
- Update imports, npm commands, and documentation whenever paths change. In the source repository, also update theme export exclusions and verify both the source site and exported theme after structural changes.
