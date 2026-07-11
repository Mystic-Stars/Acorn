import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const verify = args.includes('--verify');
const outputArg = args.find((arg) => arg.startsWith('--output='))?.slice('--output='.length);
const output = resolve(root, outputArg || '.theme-dist');
const template = join(root, 'template');

if (output === root || !relative(root, output) || relative(root, output).startsWith(`..${sep}`)) {
  throw new Error('导出目录必须位于仓库内部，且不能是仓库根目录。');
}

const excluded = new Set([
  '.git',
  '.astro',
  '.theme-dist',
  '.vercel',
  '.netlify',
  'dist',
  'node_modules',
  'template',
  '.env',
  'scripts/export-theme.mjs',
  'docs/THEME_PUBLISHING.md',
  'src/content/blog',
  'src/content/friends',
  'src/config/analytics.ts',
  'src/config/comments.ts',
  'src/config/content.ts',
  'src/config/friend-links.ts',
  'src/config/site.ts',
  'public/images',
  '.github/workflows/publish-theme.yml',
]);

function normalized(path) {
  return path.split(sep).join('/');
}

function shouldCopy(source) {
  const path = normalized(relative(root, source));
  if (!path) return true;
  if (isAbsolute(path) || path.startsWith('../')) return false;
  return ![...excluded].some((entry) => path === entry || path.startsWith(`${entry}/`));
}

async function copyRepository() {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await copyDirectory(root, output);
  await cp(join(template, 'overrides'), output, { recursive: true, force: true });
}

async function copyDirectory(sourceDirectory, targetDirectory) {
  await mkdir(targetDirectory, { recursive: true });
  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    const source = join(sourceDirectory, entry.name);
    if (!shouldCopy(source) || source === output) continue;
    const target = join(targetDirectory, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(source, target);
    } else if (entry.isFile()) {
      await cp(source, target, { force: true });
    }
  }
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? listFiles(path) : [path];
      }),
    )
  ).flat();
}

async function assertNoPersonalData() {
  const forbidden = [
    /Mystic[ _-]?Stars/i,
    /mysticstars\.cn/i,
    /3QWnhGXlcMmbY41B/,
    /acorn-twikoo\.netlify\.app/i,
    /蜀ICP备2024060713号/,
  ];
  const textExtensions = new Set(['.astro', '.css', '.html', '.js', '.json', '.md', '.mjs', '.ts', '.tsx', '.txt', '.yml', '.yaml']);
  const violations = [];

  for (const file of await listFiles(output)) {
    if (normalized(relative(output, file)) === 'README.md') continue;
    const extension = file.slice(file.lastIndexOf('.'));
    if (!textExtensions.has(extension)) continue;
    const content = (await readFile(file, 'utf8'))
      .replaceAll('Mystic-Stars/Acorn', 'SOURCE_REPOSITORY')
      .replaceAll('Mystic-Stars/acorn-theme', 'THEME_REPOSITORY')
      .replaceAll('https://github.com/Mystic-Stars', 'AUTHOR_GITHUB_PROFILE')
      .replaceAll('Mystic-Stars', 'THEME_AUTHOR');
    if (forbidden.some((pattern) => pattern.test(content))) {
      violations.push(normalized(relative(output, file)));
    }
  }

  if (violations.length) {
    throw new Error(`主题导出仍包含个人标记：\n- ${violations.join('\n- ')}`);
  }
}

function run(command, commandArgs, cwd) {
  return new Promise((resolvePromise, reject) => {
    const windows = process.platform === 'win32';
    const executable = windows ? [command, ...commandArgs].join(' ') : command;
    const child = spawn(executable, windows ? [] : commandArgs, { cwd, stdio: 'inherit', shell: windows });
    child.on('exit', (code) => (code === 0 ? resolvePromise() : reject(new Error(`${command} ${commandArgs.join(' ')} 执行失败（${code}）`))));
  });
}

await copyRepository();
await assertNoPersonalData();

const metadata = {
  generatedAt: new Date().toISOString(),
  source: 'Mystic-Stars/Acorn',
  note: 'This repository is generated. Submit source changes to the source repository.',
};
await writeFile(join(output, '.acorn-template.json'), `${JSON.stringify(metadata, null, 2)}\n`);

if (verify) {
  await run('npm', ['ci'], output);
  await run('npm', ['run', 'check'], output);
  await run('npm', ['run', 'build'], output);
}

console.log(`\nAcorn 主题已导出到 ${output}${verify ? '，并通过检查与构建。' : '。'}`);
