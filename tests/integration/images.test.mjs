import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { auditImages } from '../../scripts/images/references.mjs';
import { withTempWorkspace } from '../helpers/temp-workspace.mjs';

test('image audit accepts local files and rejects missing files and external images', async () => {
  await withTempWorkspace(async (root) => {
    for (const path of ['src/content/blog/nested', 'src/content/friends', 'public/images/posts']) {
      await mkdir(join(root, path), { recursive: true });
    }
    await writeFile(join(root, 'public/images/posts/local.png'), 'fixture');
    await writeFile(
      join(root, 'src/content/blog/post.md'),
      [
        '---',
        'cover: { upload: /images/posts/local.png }',
        '---',
        '![Missing](/images/posts/missing.png)',
        '![External](https://example.com/image.png)',
      ].join('\n'),
    );
    await writeFile(
      join(root, 'src/content/friends/friend.md'),
      ['---', 'avatar: /images/posts/local.png', '---'].join('\n'),
    );
    await writeFile(join(root, 'src/content/friends/_template.md'), 'not published');
    await writeFile(
      join(root, 'src/content/blog/nested/post.md'),
      '---\ncover: { tone: mint }\n---\n![Nested missing](/images/posts/nested-missing.png)',
    );
    const result = await auditImages(root);
    assert.equal(result.files, 3);
    assert.equal(result.references, 5);
    assert.equal(result.issues.length, 3);
    assert.ok(result.issues.some((issue) => issue.includes('missing.png')));
    assert.ok(result.issues.some((issue) => issue.includes('remote image')));
    assert.ok(result.issues.some((issue) => issue.includes('nested-missing.png')));
  });
});

test('all maintained content images exist locally', async () => {
  const result = await auditImages(process.cwd());
  assert.deepEqual(result.issues, []);
});
