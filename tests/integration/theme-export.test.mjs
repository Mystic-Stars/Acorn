import assert from 'node:assert/strict';
import { mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { isPrivateThemePath, resolveThemeOutput } from '../../scripts/theme/safety.mjs';
import { withTempWorkspace } from '../helpers/temp-workspace.mjs';

test('theme output rejects repository, source, parent and sibling paths', async () => {
  await withTempWorkspace(async (root) => {
    for (const requested of [
      '.',
      'src',
      'public',
      'template',
      '..',
      '../other',
      '.theme-dist/../src',
    ]) {
      await assert.rejects(resolveThemeOutput(root, requested));
    }
    assert.equal(await resolveThemeOutput(root), join(root, '.theme-dist'));
    assert.equal(
      await resolveThemeOutput(root, '.theme-dist/preview'),
      join(root, '.theme-dist', 'preview'),
    );
  });
});

test('existing output must be empty or carry a valid generation marker', async () => {
  await withTempWorkspace(async (root) => {
    const output = join(root, '.theme-dist');
    await mkdir(output);
    assert.equal(await resolveThemeOutput(root), output);
    await writeFile(join(output, 'keep.txt'), 'Do not delete');
    await assert.rejects(resolveThemeOutput(root));
    assert.equal(await readFile(join(output, 'keep.txt'), 'utf8'), 'Do not delete');
    const marker = join(output, '.acorn-template.json');
    await writeFile(marker, '{}');
    await assert.rejects(resolveThemeOutput(root));
    await writeFile(
      marker,
      JSON.stringify({ source: 'Mystic-Stars/Acorn', generatedAt: '2026-01-01T00:00:00Z' }),
    );
    assert.equal(await resolveThemeOutput(root), output);
  });
});

test('output cannot escape through a symbolic link or Windows junction', async () => {
  await withTempWorkspace(async (root, parent) => {
    const outside = join(parent, 'outside');
    await mkdir(outside);
    await symlink(
      outside,
      join(root, '.theme-dist'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    await assert.rejects(resolveThemeOutput(root));
    await assert.rejects(resolveThemeOutput(root, '.theme-dist/preview'));
    assert.equal(resolve(root, '..'), parent);
  });
});

test('environment variants and credential files never enter the template', () => {
  for (const path of [
    '.env',
    '.env.local',
    '.env.production',
    'nested/.env.test',
    '.npmrc',
    'private/server.key',
    'certificate.pem',
    'identity.p12',
  ]) {
    assert.equal(isPrivateThemePath(path), true, path);
  }
  for (const path of ['.env.example', 'nested/.env.example', 'src/env.d.ts', 'README.md']) {
    assert.equal(isPrivateThemePath(path), false, path);
  }
});
