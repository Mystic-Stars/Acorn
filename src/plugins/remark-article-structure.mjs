function hasLabel(node) {
  if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'html') {
    return Boolean(node.value.trim());
  }
  if (node.type === 'image' || node.type === 'imageReference') return Boolean(node.alt?.trim());
  return node.children?.some(hasLabel) ?? false;
}

/** Unlabelled images are content, not blank sections with unusable TOC anchors. */
export default function remarkArticleStructure() {
  return (tree) => {
    function walk(parent) {
      if (!Array.isArray(parent.children)) return;
      parent.children = parent.children.flatMap((node) => {
        walk(node);
        if (node.type !== 'heading' || hasLabel(node)) return [node];
        if (!node.children.length) return [];
        return [{ ...node, type: 'paragraph' }];
      });
    }
    walk(tree);
  };
}
