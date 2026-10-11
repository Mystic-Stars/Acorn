import { createHash } from 'node:crypto';
import { get } from 'node:https';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve } from 'node:path';
import sharp from 'sharp';
import {
  contentImages,
  isRemoteImage,
  promoteLocalCover,
  publicImageFile,
  replaceImageReferences,
} from './references.mjs';

const root = resolve(process.cwd());
const apply = process.argv.includes('--write');
const manifestFile = resolve(root, 'scripts/images/migration.json');
const maxBytes = 25 * 1024 * 1024;
const sourcesArg = process.argv
  .find((arg) => arg.startsWith('--sources='))
  ?.slice('--sources='.length);
const sources = sourcesArg ? JSON.parse(await readFile(resolve(root, sourcesArg), 'utf8')) : {};
const files = await contentImages(root);
const tasks = files.flatMap((file) =>
  file.refs.filter((ref) => ref.role !== 'asset').map((ref) => ({ file, ref })),
);
const pending = tasks.filter(({ file, ref }) => {
  if (ref.url.startsWith('/images/site/')) return false;
  const directory = file.kind === 'blog' ? `posts/${file.slug}` : `friends/${file.slug}`;
  return !ref.url.startsWith(`/images/${directory}/`);
});

if (!apply) {
  console.log(
    `Would localize/organize ${pending.length} references (${
      pending.filter(({ ref }) => isRemoteImage(ref.url)).length
    } remote). Run npm run images:localize -- --write to apply.`,
  );
  process.exit(0);
}

if (!pending.length) {
  console.log('All content images are already local and organized.');
  process.exit(0);
}

let manifest = { version: 1, images: [] };
try {
  manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const cache = new Map();
const replacements = new Map();
const failures = [];

function expiredCertificateResponse(url) {
  // Explicit per-source opt-in, only for unauthenticated legacy image downloads.
  return new Promise((resolveResponse, reject) => {
    const request = get(
      url,
      {
        rejectUnauthorized: false,
        signal: AbortSignal.timeout(120000),
      },
      resolveResponse,
    );
    request.on('error', reject);
  });
}

async function download(url, allowExpiredCertificate = false) {
  let error;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const source = url.startsWith('//') ? `https:${url}` : url;
      const response = allowExpiredCertificate
        ? await expiredCertificateResponse(source)
        : await fetch(source, {
            signal: AbortSignal.timeout(120000),
            headers: { 'User-Agent': 'Acorn-Image-Migration/1.0', Accept: 'image/*' },
          });
      const status = response.status ?? response.statusCode;
      if (status < 200 || status >= 300) throw new Error(`HTTP ${status}`);
      const length = response.headers.get?.('content-length') ?? response.headers['content-length'];
      if (Number(length) > maxBytes) throw new Error('Image too large');
      const chunks = [];
      let bytes = 0;
      for await (const chunk of response.body ?? response) {
        bytes += chunk.length;
        if (bytes > maxBytes) throw new Error('Image too large');
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (caught) {
      error = caught;
    }
  }
  throw error;
}

async function identify(buffer) {
  // Some friend sites publish ICO files; preserve these rather than rasterizing their artwork.
  if (buffer.length >= 22 && buffer.readUInt32LE(0) === 0x00010000) {
    const count = buffer.readUInt16LE(4);
    if (!count || buffer.length < 6 + count * 16) throw new Error('Invalid ICO');
    const entries = Array.from({ length: count }, (_, index) => {
      const offset = 6 + index * 16;
      const bytes = buffer.readUInt32LE(offset + 8);
      const start = buffer.readUInt32LE(offset + 12);
      if (!bytes || start + bytes > buffer.length) throw new Error('Invalid ICO entry');
      return { width: buffer[offset] || 256, height: buffer[offset + 1] || 256 };
    }).sort((a, b) => b.width - a.width);
    return { extension: 'ico', ...entries[0] };
  }
  const metadata = await sharp(buffer, { animated: true }).metadata();
  const extensions = {
    jpeg: 'jpg',
    png: 'png',
    webp: 'webp',
    gif: 'gif',
    avif: 'avif',
    heif: 'avif',
    svg: 'svg',
  };
  const extension = extensions[metadata.format];
  if (!extension || !metadata.width || !metadata.height)
    throw new Error('Unsupported/invalid image');
  return { extension, width: metadata.width, height: metadata.pageHeight ?? metadata.height };
}

async function load(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      (async () => {
        const recovery = sources[url];
        const source = recovery?.source ?? url;
        const buffer = isRemoteImage(source)
          ? await download(source, recovery?.allowExpiredCertificate === true)
          : await readFile(publicImageFile(root, source));
        const metadata = await identify(buffer);
        return { buffer, ...metadata, sha256: createHash('sha256').update(buffer).digest('hex') };
      })(),
    );
  }
  return cache.get(url);
}

let completed = 0;
async function migrate({ file, ref }) {
  try {
    const image = await load(ref.url);
    const directory = file.kind === 'blog' ? `posts/${file.slug}` : `friends/${file.slug}`;
    const sourceName = basename(new URL(ref.url, 'https://local.invalid').pathname);
    const stem =
      ref.role === 'body'
        ? basename(sourceName, extname(sourceName))
            .replace(/[^a-zA-Z0-9-]+/g, '-')
            .slice(0, 48) || 'image'
        : ref.role;
    const recovery = sources[ref.url];
    const target = recovery?.placeholder
      ? recovery.source
      : `/images/${directory}/${stem}-${image.sha256.slice(0, 12)}.${image.extension}`;
    const destination = publicImageFile(root, target);
    await mkdir(dirname(destination), { recursive: true });
    // Content-addressed files are safe to reuse, but never overwrite different existing bytes.
    try {
      const existing = await readFile(destination);
      if (!existing.equals(image.buffer)) throw new Error(`Destination collision: ${target}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      try {
        await writeFile(destination, image.buffer, { flag: 'wx' });
      } catch (caught) {
        if (caught.code !== 'EEXIST' || !(await readFile(destination)).equals(image.buffer))
          throw caught;
      }
    }
    const changes = replacements.get(file.path) ?? [];
    changes.push({ ...ref, url: target });
    replacements.set(file.path, changes);
    const content = relative(root, file.path).replaceAll('\\', '/');
    if (
      !manifest.images.some(
        (entry) => entry.content === content && entry.source === ref.url && entry.path === target,
      )
    ) {
      manifest.images.push({
        content,
        source: ref.url,
        path: target,
        sha256: image.sha256,
        bytes: image.buffer.length,
        width: image.width,
        height: image.height,
        ...(recovery ? { recovery } : {}),
      });
    }
    console.log(`[${++completed}/${pending.length}] ${content} -> ${target}`);
  } catch (error) {
    completed += 1;
    failures.push({
      content: relative(root, file.path).replaceAll('\\', '/'),
      source: ref.url,
      error: error.message,
    });
    console.error(`[${completed}/${pending.length}] FAILED ${ref.url}: ${error.message}`);
  }
}

// A bounded worker pool keeps image hosts and local memory usage predictable.
let cursor = 0;
await Promise.all(
  Array.from({ length: Math.min(6, pending.length) }, async () => {
    while (cursor < pending.length) await migrate(pending[cursor++]);
  }),
);
for (const file of files) {
  const changes = replacements.get(file.path);
  let source = replaceImageReferences(file.source, changes ?? []);
  if (file.kind === 'blog') source = promoteLocalCover(source);
  if (source !== file.source) await writeFile(file.path, source, 'utf8');
}
manifest.images.sort((a, b) => a.content.localeCompare(b.content) || a.path.localeCompare(b.path));
manifest.failures = failures;
await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(
  `Localized ${pending.length - failures.length}/${pending.length} references. Originals retained; no files deleted.`,
);
if (failures.length) process.exitCode = 1;
