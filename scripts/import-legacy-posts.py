"""Import Halo HTML exports into Astro Content Collection Markdown files.

Usage:
    python scripts/import-legacy-posts.py

The importer deliberately consumes the locally saved metadata inventory so that
publication dates, categories, tags, slugs, and legacy cover URLs stay aligned
with the original site. It skips Halo's generated `Hello Halo` post and the
feed-verification `test.html` file because neither is an authored blog post.
"""

from __future__ import annotations

import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPORT_DIR = ROOT / "docs" / "export2doc_20260710153018 (2)"
METADATA_PATH = ROOT / "docs" / "legacy-post-metadata.json"
OUTPUT_DIR = ROOT / "src" / "content" / "blog"
SKIPPED_EXPORTS = {"Hello Halo", "test"}

TONE_BY_CATEGORY = {
    "软件技术": "ocean",
    "资源荟萃": "sunset",
    "日常生活": "forest",
    "默认分类": "mint",
}


class Node:
    def __init__(self, tag: str | None = None, attrs: dict[str, str] | None = None):
        self.tag = tag
        self.attrs = attrs or {}
        self.children: list[Node | str] = []


class FragmentParser(HTMLParser):
    VOID_TAGS = {"br", "img", "hr", "meta", "input", "source"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]):
        node = Node(tag.lower(), {key: value or "" for key, value in attrs})
        self.stack[-1].children.append(node)
        if tag.lower() not in self.VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]):
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag: str):
        lowered = tag.lower()
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == lowered:
                del self.stack[index:]
                break

    def handle_data(self, data: str):
        self.stack[-1].children.append(data)


def normalize_text(value: str) -> str:
    return re.sub(r"[ \t\r\f\v]+", " ", html.unescape(value)).strip()


def inline(node: Node | str) -> str:
    if isinstance(node, str):
        return normalize_text(node)

    content = "".join(inline(child) for child in node.children)
    tag = node.tag

    if tag == "br":
        return "  \n"
    if tag == "img":
        src = node.attrs.get("src", "").strip()
        alt = node.attrs.get("alt", "").strip()
        return f"![{alt}]({src})" if src else ""
    if tag == "a":
        href = node.attrs.get("href", "").strip()
        return f"[{content or href}]({href})" if href else content
    if tag in {"strong", "b"}:
        return f"**{content}**" if content else ""
    if tag in {"em", "i"}:
        return f"*{content}*" if content else ""
    if tag in {"s", "del", "strike"}:
        return f"~~{content}~~" if content else ""
    if tag == "code":
        return f"`{content.replace('`', '\\`')}`" if content else ""
    return content


def block(node: Node | str, depth: int = 0) -> str:
    if isinstance(node, str):
        return normalize_text(node)

    tag = node.tag
    if tag in {"script", "style"}:
        return ""
    if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
        return f"{'#' * int(tag[1])} {inline(node)}\n\n"
    if tag == "p":
        content = inline(node)
        return f"{content}\n\n" if content else ""
    if tag == "blockquote":
        content = render_children(node, depth).strip()
        if not content:
            return ""
        return "\n".join(f"> {line}" if line else ">" for line in content.splitlines()) + "\n\n"
    if tag in {"ul", "ol"}:
        lines: list[str] = []
        marker_index = 1
        for child in node.children:
            if not isinstance(child, Node) or child.tag != "li":
                continue
            body = render_children(child, depth + 1).strip()
            if not body:
                continue
            marker = f"{marker_index}." if tag == "ol" else "-"
            marker_index += 1
            lines.append(f"{'  ' * depth}{marker} {body.replace(chr(10), chr(10) + '  ' * (depth + 1))}")
        return "\n".join(lines) + ("\n\n" if lines else "")
    if tag == "pre":
        code = "".join(text_content(child) for child in node.children).strip("\n")
        if not code:
            return ""
        # Use a fence longer than any run inside the source so nested examples
        # (for example, a prompt that documents Markdown fences) stay intact.
        longest_backtick_run = max((len(run) for run in re.findall(r"`+", code)), default=0)
        fence = "`" * max(3, longest_backtick_run + 1)
        return f"{fence}\n{code}\n{fence}\n\n"
    if tag == "hr":
        return "---\n\n"
    if tag == "img":
        return f"{inline(node)}\n\n"
    return render_children(node, depth)


def render_children(node: Node, depth: int = 0) -> str:
    return "".join(block(child, depth) for child in node.children)


def text_content(node: Node | str) -> str:
    if isinstance(node, str):
        return normalize_text(node)
    return "".join(text_content(child) for child in node.children)


def html_to_markdown(source: str) -> str:
    parser = FragmentParser()
    parser.feed(source)
    parser.close()
    markdown = render_children(parser.root)
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    return markdown.strip() + "\n"


FENCED_CODE_BLOCK = re.compile(
    r"^(?P<fence>`{3,})[^\n]*\n(?P<code>.*?)(?:\n)?^(?P=fence)[ \t]*$",
    re.MULTILINE | re.DOTALL,
)


def use_animal_code_blocks(markdown: str) -> tuple[str, bool]:
    """Replace Markdown fences with the site's Animal Island CodeBlock component."""

    def replace(match: re.Match[str]) -> str:
        code = match.group("code")
        return f"<ArticleCodeBlock code={{{json.dumps(code, ensure_ascii=False)}}} />"

    content, replacements = FENCED_CODE_BLOCK.subn(replace, markdown)
    if not replacements:
        return markdown, False

    component_import = "import ArticleCodeBlock from '@components/ArticleCodeBlock.astro';\n\n"
    return component_import + content, True


def make_description(markdown: str) -> str:
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", markdown)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"[`*_>#\-]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:150].rstrip("，。；、 ") + ("…" if len(text) > 150 else "")


def yaml_string(value: str) -> str:
    # JSON strings are valid YAML scalars and safely retain emojis and quotes.
    return json.dumps(value, ensure_ascii=False)


def frontmatter(post: dict, description: str) -> str:
    cover = post.get("cover")
    category = post.get("category") or next(iter(post.get("categories", [])), None)
    tone = TONE_BY_CATEGORY.get(category, "mint")
    tag_lines = "\n".join(f"  - {yaml_string(tag)}" for tag in post.get("tags", []))
    lines = [
        "---",
        f"title: {yaml_string(post['title'])}",
        f"description: {yaml_string(description or post['title'])}",
        f"pubDate: {post['date'].replace(' ', 'T')}:00+08:00",
        "cover:",
        f"  tone: {tone}",
        f"  label: {yaml_string(category or 'MYSTIC STARS')}",
        f"  url: {yaml_string(cover)}" if cover else "  # No legacy cover was set.",
        f"  alt: {yaml_string(post['title'] + ' 的封面图')}",
        "draft: false",
        f"featured: {'true' if post.get('pinned') else 'false'}",
        f"category: {yaml_string(category)}" if category else "",
        "tags:",
        tag_lines or "  []",
        f"author: {yaml_string(post.get('author') or 'Mystic Stars')}",
        "---",
        "",
    ]
    return "\n".join(line for line in lines if line != "") + "\n\n"


def main() -> None:
    metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))["posts"]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    imported = 0

    for post in metadata:
        source_path = EXPORT_DIR / f"{post['title']}.html"
        if not source_path.exists():
            raise FileNotFoundError(f"Missing exported HTML for {post['title']}: {source_path}")
        markdown = html_to_markdown(source_path.read_text(encoding="utf-8"))
        content, needs_mdx = use_animal_code_blocks(markdown)
        output_path = OUTPUT_DIR / f"{post['slug']}{'.mdx' if needs_mdx else '.md'}"
        stale_path = output_path.with_suffix('.md' if needs_mdx else '.mdx')
        stale_path.unlink(missing_ok=True)
        output_path.write_text(frontmatter(post, make_description(markdown)) + content, encoding="utf-8")
        imported += 1

    skipped = sorted(path.stem for path in EXPORT_DIR.glob("*.html") if path.stem in SKIPPED_EXPORTS)
    print(f"Imported {imported} posts into {OUTPUT_DIR.relative_to(ROOT)}.")
    print(f"Skipped non-article exports: {', '.join(skipped)}.")


if __name__ == "__main__":
    main()
