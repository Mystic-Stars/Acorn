/** @type {import('prettier').Config} */
export default {
  plugins: ['prettier-plugin-astro'],
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
  useTabs: false,
};
