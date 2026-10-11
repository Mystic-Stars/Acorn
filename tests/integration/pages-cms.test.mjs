import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { test } from 'node:test';
import ts from 'typescript';
import { parse } from 'yaml';
import { friendLinksConfig } from '../../src/config/friend-links.ts';

const root = process.cwd();
const cms = parse(await readFile(resolve(root, '.pages.yml'), 'utf8'));
const entries = cms.content.flatMap(function flatten(entry) {
  return entry.type === 'group' ? entry.items.flatMap(flatten) : [entry];
});
const blog = entries.find((entry) => entry.name === 'blog');
const friends = entries.find((entry) => entry.name === 'friends');
const field = (entry, name) => entry.fields.find((item) => item.name === name);
const coverField = (name) => field(blog, 'cover').fields.find((item) => item.name === name);

// Read the actual schema declarations without loading Astro's virtual runtime.
const source = ts.createSourceFile(
  'src/content.config.ts',
  await readFile(resolve(root, 'src/content.config.ts'), 'utf8'),
  ts.ScriptTarget.Latest,
  true,
);
function findNode(node, predicate) {
  if (predicate(node)) return node;
  return ts.forEachChild(node, (child) => findNode(child, predicate));
}
function schemaCall(node, name) {
  return findNode(
    node,
    (child) =>
      ts.isCallExpression(child) &&
      ts.isPropertyAccessExpression(child.expression) &&
      ts.isIdentifier(child.expression.expression) &&
      child.expression.expression.text === 'z' &&
      child.expression.name.text === name,
  );
}
function schemaObject(node) {
  return schemaCall(node, 'object')?.arguments[0];
}
function schemaFields(collection) {
  const declaration = findNode(
    source,
    (node) => ts.isVariableDeclaration(node) && node.name.getText(source) === collection,
  );
  return schemaObject(declaration).properties;
}
function sourceFields(collection) {
  return schemaFields(collection).map((property) => property.name.getText(source));
}
function bounds(property, type) {
  const result = {};
  let call = schemaCall(property, type);
  while (
    call?.parent &&
    ts.isPropertyAccessExpression(call.parent) &&
    ts.isCallExpression(call.parent.parent)
  ) {
    call = call.parent.parent;
    const name = call.expression.name.text;
    if (['min', 'max'].includes(name) && ts.isNumericLiteral(call.arguments[0])) {
      result[name] = Number(call.arguments[0].text);
    }
  }
  return result;
}

test('CMS exposes the frontmatter fields declared by both Astro collections', () => {
  assert.deepEqual(
    blog.fields
      .filter((item) => item.name !== 'body')
      .map((item) => item.name)
      .sort(),
    sourceFields('blog').sort(),
  );
  assert.deepEqual(friends.fields.map((item) => item.name).sort(), sourceFields('friends').sort());

  const blogDeclaration = findNode(
    source,
    (node) => ts.isVariableDeclaration(node) && node.name.getText(source) === 'blog',
  );
  const cover = schemaObject(blogDeclaration).properties.find(
    (property) => property.name.getText(source) === 'cover',
  );
  assert.deepEqual(
    field(blog, 'cover')
      .fields.map((item) => item.name)
      .sort(),
    schemaObject(cover)
      .properties.map((property) => property.name.getText(source))
      .filter((name) => name !== 'image')
      .sort(),
  );
  assert.equal(cms.settings.content.merge, true, 'Astro cover.image must survive CMS saves');
  assert.deepEqual(field(friends, 'category').options.values, [...friendLinksConfig.categories]);
});

test('CMS text limits and enum choices match the actual content schema', () => {
  const blogProperties = schemaFields('blog');
  const friendProperties = schemaFields('friends');
  const coverProperties = schemaObject(
    blogProperties.find((property) => property.name.getText(source) === 'cover'),
  ).properties;
  for (const [properties, cmsFields] of [
    [blogProperties, blog.fields],
    [friendProperties, friends.fields],
    [coverProperties, field(blog, 'cover').fields],
  ]) {
    for (const property of properties) {
      const name = property.name.getText(source);
      const cmsField = cmsFields.find((item) => item.name === name);
      if (!cmsField || !['string', 'text', 'select'].includes(cmsField.type)) continue;
      const stringBounds = bounds(property, 'string');
      if (stringBounds.min && (cmsField.required || cmsField.list)) {
        assert.equal(cmsField.options?.minlength, stringBounds.min, name);
      }
      if (stringBounds.max) assert.equal(cmsField.options?.maxlength, stringBounds.max, name);
      const arrayBounds = bounds(property, 'array');
      if (arrayBounds.max) assert.equal(cmsField.list?.max, arrayBounds.max, name);
      const choices = schemaCall(property, 'enum')?.arguments[0];
      if (choices) {
        assert.deepEqual(
          cmsField.options.values.map((value) => (typeof value === 'string' ? value : value.name)),
          choices.elements.map((element) => element.text),
          name,
        );
      }
    }
  }
});

test('body uploads and cover uploads share a valid public media mapping', () => {
  const body = field(blog, 'body');
  assert.equal(body.type, 'rich-text');
  assert.equal(body.options.format, 'markdown');
  assert.equal(body.options.switcher, true);
  assert.equal(coverField('url').type, 'string', 'remote URLs cannot use a CMS image field');
  assert.equal(coverField('upload').type, 'image');
  assert.equal(field(friends, 'avatar').type, 'image');
  assert.deepEqual(
    cms.media.map((media) => media.name),
    ['posts', 'friends', 'site'],
  );
  for (const [item, name, folder] of [
    [body, 'posts', '/images/posts/uploads'],
    [coverField('upload'), 'posts', '/images/posts/uploads'],
    [field(friends, 'avatar'), 'friends', '/images/friends'],
  ]) {
    const media = cms.media.find((entry) => entry.name === name);
    assert.equal(item.options.media, media.name);
    assert.ok(item.options.path === media.input || item.options.path.startsWith(`${media.input}/`));
    assert.equal(item.options.path.replace(media.input, media.output), folder);
    assert.ok(item.options.extensions.every((extension) => media.extensions.includes(extension)));
  }
  for (const media of cms.media) {
    assert.equal(media.input, `public/images/${media.name}`);
    assert.equal(media.output, `/images/${media.name}`);
    assert.equal(media.rename, 'random');
  }
});

test('publishing and source editing protect permanent article URLs', () => {
  assert.equal(field(blog, 'draft').default, true);
  assert.equal(field(blog, 'updatedDate').default, '');
  assert.equal(field(friends, 'updatedAt').default, '');
  assert.equal(field(blog, 'legacyViews').options.min, 0);
  assert.equal(blog.operations.rename, false);
  assert.equal(blog.filename.field, 'create');
  assert.ok(
    blog.filename.template.includes('{second}'),
    'Chinese titles need a non-empty filename fallback',
  );
  const raw = entries.find((entry) => entry.name === 'blog-source');
  assert.equal(raw.path, blog.path);
  assert.equal(raw.format, 'code');
  assert.equal(raw.fields, undefined, 'the complete file must bypass structured/rich text editing');
  assert.deepEqual(raw.operations, { create: false, rename: false, delete: false });
});

test('CMS paths exist and advanced entries cover all editable config modules', async () => {
  for (const media of cms.media) await access(resolve(root, media.input));
  await access(resolve(root, field(blog, 'body').options.path));
  assert.equal(new Set(entries.map((entry) => entry.name)).size, entries.length);
  for (const entry of entries) {
    const path = resolve(root, entry.path);
    assert.ok(!relative(root, path).startsWith('..'));
    await access(path);
    if (entry.type === 'file') {
      assert.equal(entry.operations.delete, false, entry.path);
    }
  }
  const configs = (await readdir(resolve(root, 'src/config')))
    .filter((name) => name.endsWith('.ts') && !['types.ts', 'index.ts'].includes(name))
    .map((name) => `src/config/${name}`)
    .sort();
  assert.deepEqual(
    entries
      .filter((entry) => entry.type === 'file')
      .map((entry) => entry.path)
      .sort(),
    configs,
  );
});

test('CMS validation action targets a dispatchable workflow on the current branch', async () => {
  const action = cms.actions.find((item) => item.name === 'validate-site');
  const workflow = parse(
    await readFile(resolve(root, '.github/workflows', action.workflow), 'utf8'),
  );
  assert.equal(action.ref, 'current');
  assert.equal(workflow.on.workflow_dispatch.inputs.payload.type, 'string');
  assert.equal(workflow.permissions.contents, 'read');
  const commands = workflow.jobs.check.steps.map((step) => step.run).filter(Boolean);
  for (const command of ['npm test', 'npm run check', 'npm run build', 'npm run test:build']) {
    assert.ok(commands.includes(command), command);
  }
});
