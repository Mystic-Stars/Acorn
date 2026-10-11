import { readFile, readdir, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { JSDOM } from 'jsdom';
import { parseDocument } from 'yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const markdown = unified().use(remarkParse).use(remarkGfm);
export const isRemoteImage = (url) => /^(?:https?:)?\/\//i.test(url);

function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

/** Source ranges let migration preserve prose, code blocks, dates and YAML comments. */
export function imageReferences(source, kind) {
  const frontmatter = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!frontmatter) throw new Error('Missing YAML frontmatter');
  const yamlOffset = frontmatter[0].indexOf(frontmatter[1]);
  const document = parseDocument(frontmatter[1]);
  if (document.errors.length) throw new Error(document.errors[0].message);
  const bodyOffset = frontmatter[0].length;
  const body = source.slice(bodyOffset);
  const refs = [];
  const addField = (path, role) => {
    const node = document.getIn(path, true);
    if (typeof node?.value !== 'string' || !node.value.trim()) return;
    refs.push({
      url: node.value,
      role,
      field: path.join('.'),
      start: yamlOffset + node.range[0],
      end: yamlOffset + node.range[1],
      syntax: 'yaml',
    });
  };
  if (kind === 'blog') {
    addField(['cover', 'url'], 'cover');
    addField(['cover', 'upload'], 'cover');
    addField(['cover', 'image'], 'asset');
  } else {
    addField(['avatar'], 'avatar');
  }

  const tree = markdown.parse(body);
  const definitions = new Map();
  walk(tree, (node) => {
    if (node.type === 'definition') definitions.set(node.identifier, node);
  });
  walk(tree, (node) => {
    if (node.type === 'imageReference') {
      const definition = definitions.get(node.identifier);
      if (!definition) return;
      const snippet = body.slice(definition.position.start.offset, definition.position.end.offset);
      const index = snippet.indexOf(definition.url);
      if (index < 0) throw new Error(`Cannot locate image reference URL: ${definition.url}`);
      refs.push({
        url: definition.url,
        role: 'body',
        start: bodyOffset + definition.position.start.offset + index,
        end: bodyOffset + definition.position.start.offset + index + definition.url.length,
        syntax: 'markdown',
      });
      return;
    }
    if (node.type === 'image') {
      const snippet = body.slice(node.position.start.offset, node.position.end.offset);
      const index = snippet.indexOf(node.url);
      if (index < 0) throw new Error(`Cannot locate image URL: ${node.url}`);
      refs.push({
        url: node.url,
        role: 'body',
        start: bodyOffset + node.position.start.offset + index,
        end: bodyOffset + node.position.start.offset + index + node.url.length,
        syntax: 'markdown',
      });
    }
    if (
      node.type === 'link' &&
      node.children?.some((child) => child.type === 'image' && child.url === node.url)
    ) {
      const snippet = body.slice(node.position.start.offset, node.position.end.offset);
      const index = snippet.lastIndexOf(node.url);
      if (index < 0) throw new Error(`Cannot locate image link URL: ${node.url}`);
      refs.push({
        url: node.url,
        role: 'body',
        start: bodyOffset + node.position.start.offset + index,
        end: bodyOffset + node.position.start.offset + index + node.url.length,
        syntax: 'markdown',
      });
    }
    if (node.type !== 'html') return;
    const dom = new JSDOM(node.value, { includeNodeLocations: true });
    for (const image of dom.window.document.querySelectorAll('img')) {
      const location = dom.nodeLocation(image)?.attrs?.src;
      if (!location) continue;
      const attribute = node.value.slice(location.startOffset, location.endOffset);
      const value = /^(src\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))$/i.exec(attribute);
      if (!value) continue;
      const quoted = value[2] !== undefined || value[3] !== undefined;
      const start =
        bodyOffset +
        node.position.start.offset +
        location.startOffset +
        value[1].length +
        (quoted ? 1 : 0);
      refs.push({
        url: image.getAttribute('src'),
        role: 'body',
        start,
        end: start + (value[2] ?? value[3] ?? value[4]).length,
        syntax: 'html',
      });
    }
    dom.window.close();
  });
  const unique = new Map();
  for (const ref of refs) unique.set(`${ref.start}:${ref.end}:${ref.url}`, ref);
  return { refs: [...unique.values()], document, yamlOffset };
}

export function replaceImageReferences(source, replacements) {
  let result = source;
  for (const { start, end, url, syntax } of [...replacements].sort((a, b) => b.start - a.start)) {
    const value = syntax === 'yaml' ? JSON.stringify(url) : url;
    result = result.slice(0, start) + value + result.slice(end);
  }
  return result;
}

/** Keep migrated covers visible in the CMS image picker without changing legacy precedence. */
export function promoteLocalCover(source) {
  const { document, yamlOffset } = imageReferences(source, 'blog');
  const cover = document.getIn(['cover'], true);
  const url = cover?.items?.find((item) => item.key?.value === 'url');
  if (
    !url?.value?.value?.startsWith('/images/') ||
    document.getIn(['cover', 'upload']) ||
    document.getIn(['cover', 'image'])
  )
    return source;
  const start = yamlOffset + url.key.range[0];
  const end = yamlOffset + url.key.range[1];
  return source.slice(0, start) + 'upload' + source.slice(end);
}

export async function contentImages(root) {
  const files = [];
  async function scan(directory, kind, prefix = '') {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('_')) continue;
      const path = resolve(directory, entry.name);
      const name = `${prefix}${entry.name}`;
      if (entry.isDirectory()) {
        await scan(path, kind, `${name}/`);
      } else if (entry.isFile() && name.endsWith('.md')) {
        const source = await readFile(path, 'utf8');
        files.push({
          path,
          kind,
          slug: name.slice(0, -3),
          source,
          ...imageReferences(source, kind),
        });
      }
    }
  }
  for (const kind of ['blog', 'friends']) {
    await scan(resolve(root, 'src/content', kind), kind);
  }
  return files;
}

/** Reject encoded traversal before joining untrusted content paths with public/. */
export function publicImageFile(root, url) {
  if (!url.startsWith('/') || url.startsWith('//')) throw new Error(`Not a public path: ${url}`);
  const path = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  if (path.includes('\\') || path.includes('\0') || path.split('/').includes('..')) {
    throw new Error(`Unsafe image path: ${url}`);
  }
  const publicRoot = resolve(root, 'public');
  const file = resolve(publicRoot, `.${path}`);
  const local = relative(publicRoot, file);
  if (!local || local === '..' || local.startsWith(`..${sep}`) || isAbsolute(local)) {
    throw new Error(`Image escapes public/: ${url}`);
  }
  return file;
}

export async function auditImages(root) {
  const issues = [];
  const files = await contentImages(root);
  for (const file of files) {
    for (const ref of file.refs) {
      if (isRemoteImage(ref.url)) {
        issues.push(`${relative(root, file.path)}: remote image ${ref.url}`);
        continue;
      }
      try {
        const path =
          ref.role === 'asset' ? resolve(file.path, '..', ref.url) : publicImageFile(root, ref.url);
        if (!(await stat(path)).isFile()) throw new Error('Not a file');
      } catch (error) {
        issues.push(
          `${relative(root, file.path)}: missing/invalid image ${ref.url} (${error.message})`,
        );
      }
    }
  }
  return {
    files: files.length,
    references: files.reduce((sum, file) => sum + file.refs.length, 0),
    issues,
  };
}
