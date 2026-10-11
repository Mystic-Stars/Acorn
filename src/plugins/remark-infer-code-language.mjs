const shellCommandPattern =
  /^(?:#!\/bin\/(?:ba)?sh|(?:apt|brew|cd|curl|dnf|echo|export|git|if|npm|pip|sudo|wget|yum)\b)/m;
const yamlPattern = /^[\w-]+:\s*.+$/m;

export function inferLanguage(source) {
  const code = source.trim();
  if (!code) return undefined;

  // Bound heuristic work for large pasted blocks. Explicit languages always take precedence.
  const sample = code.slice(0, 32768);
  if (/^[{[]/.test(code) && code.length <= 65536) {
    try {
      JSON.parse(code);
      return 'json';
    } catch {
      // Object literals and incomplete snippets can still be identified below.
    }
  }
  if (
    /^(?:from\s+[\w.]+\s+import|import\s+[\w., ]+(?:\s+as\s+\w+)?$|(?:async\s+)?def\s+\w+\(|print\()/m.test(
      sample,
    )
  ) {
    return 'python';
  }
  if (
    /^(?:const|let|var)\s+\w+|=>|console\.(?:log|error|warn)\(|^import\s+.+\s+from\s+['"]/m.test(
      sample,
    )
  ) {
    return 'javascript';
  }
  if (/^\s*{\s*(?:\n\s*)?[\w$]+\s*:/m.test(sample)) return 'javascript';
  if (/^(?:SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE)\b/im.test(sample)) return 'sql';
  if (shellCommandPattern.test(sample)) return 'shell';
  if (/^\s*<(?:!doctype|html|div|section|script|style)\b/i.test(sample)) return 'html';
  if (/^(?:graph|flowchart|sequenceDiagram|classDiagram)\b/m.test(sample)) return 'mermaid';
  if (/^\s*[.#][\w-]+\s*{|^[\w-]+\s*:\s*[^;{}]+;/m.test(sample)) return 'css';
  if (yamlPattern.test(sample) && !/[{};]/.test(sample)) return 'yaml';
  return undefined;
}

function walk(node) {
  if (node?.type === 'code') {
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
