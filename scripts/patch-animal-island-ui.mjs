import { access, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const packageRoot = resolve('node_modules/animal-island-ui/dist/es');

try {
  await access(packageRoot);
} catch {
  console.log('[animal-island-ui] Package not installed; compatibility patch skipped.');
  process.exit(0);
}

// The published ESM output contains an incomplete nested react-dom directory.
// Removing it lets Node resolve the application's compatible React peer dependency.
await rm(resolve(packageRoot, 'node_modules'), { recursive: true, force: true });

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory()
        ? collectJavaScriptFiles(path)
        : path.endsWith('.js')
          ? [path]
          : [];
    }),
  );

  return nested.flat();
}

const files = await collectJavaScriptFiles(packageRoot);
let patchedFiles = 0;

for (const file of files) {
  const source = await readFile(file, 'utf8');
  let patched = source
    // The public stylesheet is imported once by BaseLayout. Node cannot execute
    // the package's duplicate per-module CSS imports during Astro prerendering.
    .replace(/^import\s+["'][^"']+\.css["'];\r?\n?/gm, '')
    // The package root eagerly imports two unused components with image imports.
    // File URLs keep those modules Node-loadable without changing public imports.
    .replace(
      /^import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+\.(?:png|jpe?g|gif|svg|webp))["'];/gm,
      'const $1 = new URL("$2", import.meta.url).href;',
    );

  if (file.endsWith('/_virtual/client.js') || file.endsWith('\\_virtual\\client.js')) {
    patched = 'import * as client from "react-dom/client";\nexport { client as c };\n';
  }

  if (patched !== source) {
    await writeFile(file, patched, 'utf8');
    patchedFiles += 1;
  }
}

console.log(
  `[animal-island-ui] Astro prerender compatibility ready (${patchedFiles} files updated).`,
);
