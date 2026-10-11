import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'astro/zod';
import {
  imageLocation,
  optionalContentField,
  resolveCover,
  uploadedImageLocation,
} from '../../src/lib/content-fields.ts';

test('cleared CMS optional dates are absent instead of invalid dates or epoch zero', () => {
  const date = optionalContentField(z.coerce.date());
  for (const value of [undefined, null, '', '  ']) {
    assert.equal(date.parse(value), undefined);
  }
  for (const value of ['2026-10-11', '2026-10-11T09:30:00+08:00']) {
    assert.equal(date.parse(value).valueOf(), new Date(value).valueOf());
  }
  assert.equal(date.safeParse('not-a-date').success, false);
});

test('cleared optional labels and image controls respect validation when present', () => {
  const label = optionalContentField(z.string().min(1).max(32));
  const image = optionalContentField(imageLocation);
  for (const value of [undefined, null, '', '  ']) {
    assert.equal(label.parse(value), undefined);
    assert.equal(image.parse(value), undefined);
  }
  assert.equal(label.parse('随笔'), '随笔');
  assert.equal(label.safeParse('x'.repeat(33)).success, false);
  assert.equal(image.safeParse('not-an-image-url').success, false);
});

test('remote covers and public images work while repository and transient paths fail', () => {
  for (const value of [
    'https://example.com/cover.webp?width=1000',
    'http://example.com/avatar',
    '/images/posts/cover.webp',
    '/favicon.svg',
  ]) {
    assert.equal(imageLocation.parse(value), value);
  }
  for (const value of [
    '//example.com/cover.webp',
    'public/images/posts/cover.webp',
    'blob:https://example.com/temporary',
    'data:image/png;base64,abc',
    'ftp://example.com/cover.webp',
    'invalid-url',
  ]) {
    assert.equal(imageLocation.safeParse(value).success, false, value);
  }
  assert.equal(uploadedImageLocation.parse('/images/posts/new.webp'), '/images/posts/new.webp');
  assert.equal(uploadedImageLocation.safeParse('https://example.com/new.webp').success, false);
  assert.equal(uploadedImageLocation.safeParse('/favicon.svg').success, false);
});

test('uploaded cover overrides both legacy sources and clearing it restores them', () => {
  const image = { src: '/_astro/old.webp', width: 1000, height: 500, format: 'webp' };
  const cover = {
    tone: 'mint',
    label: '随笔',
    image,
    url: 'https://example.com/old.webp',
    upload: '/images/posts/new.webp',
  };
  const resolved = resolveCover(cover);
  assert.equal(resolved.image, undefined);
  assert.equal(resolved.url, cover.upload);
  assert.equal(resolved.tone, cover.tone);
  assert.equal(cover.image, image);
  assert.equal(cover.url, 'https://example.com/old.webp');

  const restored = resolveCover({ ...cover, upload: undefined });
  assert.equal(restored.image, image);
  assert.equal(restored.url, cover.url);
  assert.equal(resolveCover({ tone: 'forest' }).url, undefined);
});
