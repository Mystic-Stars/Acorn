# Upstream refresh

Checked on 2026-10-11 against `guokaigdg/animal-island-ui`, commit
`7e50eb79e4b94ca122049b77256029dc37a06110`.

The current upstream skill lives in `skills/animal-island-ui-style/`, with API
references grouped under `references/components/`. The canonical visual rules
and tokens now live in `docs/design-system/design-rules.md` and
`docs/design-system/design-tokens.md`.

Source: https://github.com/guokaigdg/animal-island-ui/tree/7e50eb79e4b94ca122049b77256029dc37a06110/skills/animal-island-ui-style

The repository's `AI_USAGE.md` and other bundled reference snapshots remain
pinned to `UPSTREAM_COMMIT.txt`. They describe the installed package API.
New upstream components, external icon packages, and CSS variables are not
automatically available in this project. Check package declarations before
using them; do not upgrade dependencies as a side effect of refreshing guidance.

The relevant current contracts remain: parchment surfaces, mint accents, warm
text, pill controls, ribbon Title headings, shadowless Cards, primary-button
stacked shadows, Nunito/Noto Sans SC typography, and accessible restrained motion.
Use the existing icon library or the installed package's documented Icon API.
