const shellCommandPattern =
  /^(?:#!\/bin\/(?:ba)?sh|(?:apt|brew|cd|curl|dnf|echo|export|git|if|npm|pip|sudo|wget|yum)\b)/m;
const yamlPattern = /^[\w-]+:\s*.+$/m;

function inferLanguage(source) {
  const code = source.trim();
  if (!code) return undefined;

  if (/^(?:from\s+[\w.]+\s+import|import\s+[\w.]+|def\s+\w+\(|print\()/m.test(code)) {
    return 'python';
  }
  if (/^(?:const|let|var)\s+\w+|=>|console\.(?:log|error|warn)\(/m.test(code)) {
    return 'javascript';
  }
  if (/^\s*{\s*(?:\n\s*)?[\w$]+\s*:/m.test(code)) return 'javascript';
  if (/^(?:SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE)\b/im.test(code)) return 'sql';
  if (shellCommandPattern.test(code)) return 'shell';
  if (/^\s*<(?:!doctype|html|div|section|script|style)\b/i.test(code)) return 'html';
  if (/^(?:graph|flowchart|sequenceDiagram|classDiagram)\b/m.test(code)) return 'mermaid';
  if (/^\s*[.#][\w-]+\s*{|^[\w-]+\s*:\s*[^;{}]+;/m.test(code)) return 'css';
  if (yamlPattern.test(code) && !/[{};]/.test(code)) return 'yaml';

  try {
    JSON.parse(code);
    return 'json';
  } catch {
    return undefined;
  }
}

function normalizeCodeIndent(source) {
  const lines = source.split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim());
  if (!nonEmptyLines.length) return source;

  const sharedIndent = Math.min(
    ...nonEmptyLines.map((line) => line.match(/^[\t ]*/)?.[0].length ?? 0),
  );
  if (!sharedIndent) return source;

  return lines.map((line) => (line.trim() ? line.slice(sharedIndent) : '')).join('\n');
}

function walk(node) {
  if (node?.type === 'code') {
    node.value = normalizeCodeIndent(node.value);
    if (!node.lang) node.lang = inferLanguage(node.value);
  }

  if (Array.isArray(node?.children)) {
    node.children.forEach(walk);
  }
}

/** Infer Shiki-compatible languages only for fenced blocks whose author left the language blank. */
export default function remarkInferCodeLanguage() {
  return (tree) => walk(tree);
}
