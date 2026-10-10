import { lstat, readdir, readFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

/** Only the dedicated generated directory may be replaced, never source or parent directories. */
export async function resolveThemeOutput(root, requested = '.theme-dist') {
  const output = resolve(root, requested);
  const generatedRoot = resolve(root, '.theme-dist');
  const nestedPath = relative(generatedRoot, output);

  if (nestedPath === '..' || nestedPath.startsWith(`..${sep}`) || isAbsolute(nestedPath)) {
    throw new Error('导出目录只能是 .theme-dist 或它的子目录。');
  }

  const parts = relative(root, output).split(sep);
  let current = root;
  for (const part of parts) {
    current = join(current, part);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink() || !info.isDirectory()) {
        throw new Error('导出路径不能包含符号链接、目录联接或普通文件。');
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      break;
    }
  }

  let entries;
  try {
    entries = await readdir(output);
  } catch (error) {
    if (error.code === 'ENOENT') return output;
    throw error;
  }

  if (entries.length > 0) {
    let metadata;
    try {
      const marker = join(output, '.acorn-template.json');
      if (!(await lstat(marker)).isFile()) throw new Error('Invalid export marker.');
      metadata = JSON.parse(await readFile(marker, 'utf8'));
    } catch {
      throw new Error('拒绝清空非 Acorn 生成的目录；请选择空目录或已有的主题导出目录。');
    }
    if (metadata.source !== 'Mystic-Stars/Acorn' || typeof metadata.generatedAt !== 'string') {
      throw new Error('导出目录缺少有效的 Acorn 生成标记。');
    }
  }

  return output;
}

export function isPrivateThemePath(path) {
  return path
    .split('/')
    .some(
      (part) =>
        (part !== '.env.example' && (part === '.env' || part.startsWith('.env.'))) ||
        part === '.npmrc' ||
        /\.(?:pem|key|p12|pfx)$/i.test(part),
    );
}
