import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/** Read local image headers once per build; never fetch remote media while rendering. */
export default function rehypeLocalImages({
  publicDirectory = fileURLToPath(new URL('../../public/', import.meta.url)),
} = {}) {
  const dimensions = new Map();
  const publicRoot = resolve(publicDirectory);
  return async (tree) => {
    const pending = [];
    function walk(node) {
      if (node.type === 'element' && node.tagName === 'img') {
        const properties = node.properties;
        properties.loading ??= 'lazy';
        properties.decoding ??= 'async';
        if (
          typeof properties.src === 'string' &&
          properties.src.startsWith('/') &&
          !properties.src.startsWith('//') &&
          !properties.width &&
          !properties.height
        ) {
          let pathname;
          try {
            pathname = decodeURIComponent(properties.src.split(/[?#]/)[0]);
          } catch {
            return;
          }
          const imagePath = resolve(publicRoot, `.${pathname}`);
          const pathWithinRoot = relative(publicRoot, imagePath);
          if (!pathWithinRoot || pathWithinRoot.startsWith('..') || isAbsolute(pathWithinRoot))
            return;
          if (!dimensions.has(imagePath)) {
            // Failed reads are cached too. Missing assets are reported by images:check.
            dimensions.set(
              imagePath,
              sharp(imagePath)
                .metadata()
                .catch(() => undefined),
            );
          }
          pending.push(
            dimensions.get(imagePath).then((metadata) => {
              if (!metadata?.width || !metadata?.height) return;
              const rotated = [5, 6, 7, 8].includes(metadata.orientation);
              properties.width = rotated ? metadata.height : metadata.width;
              properties.height = rotated ? metadata.width : metadata.height;
            }),
          );
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(walk);
    }
    walk(tree);
    await Promise.all(pending);
  };
}
