import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

/** Isolate filesystem tests and verify the cleanup boundary before deleting anything. */
export async function withTempWorkspace(run) {
  const parent = await mkdtemp(join(tmpdir(), 'acorn-test-'));
  try {
    const root = join(parent, 'repo');
    await mkdir(root);
    return await run(root, parent);
  } finally {
    const remaining = relative(resolve(tmpdir()), resolve(parent));
    assert.ok(
      remaining &&
        remaining !== '..' &&
        !remaining.startsWith(`..${sep}`) &&
        !isAbsolute(remaining),
    );
    await rm(parent, { recursive: true, force: true });
  }
}
