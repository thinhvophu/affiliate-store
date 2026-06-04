import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import type { Heading, Root } from "mdast";
import { createHeadingSlugger } from "@/lib/mdx-slug";

export interface TocEntry {
  depth: 2 | 3;
  text: string;
  id: string;
}

export function extractToc(content: string): TocEntry[] {
  const tree = unified().use(remarkParse).parse(content) as Root;
  const slugger = createHeadingSlugger();
  const entries: TocEntry[] = [];

  visit(tree, "heading", (node: Heading) => {
    const text = toString(node);
    // Always advance the slugger for every heading (h1–h6) so duplicate-suffix
    // counters stay in sync with rehypeHeadingSlugs, which also visits all levels.
    const id = slugger.slug(text);
    if (node.depth === 2 || node.depth === 3) {
      entries.push({ depth: node.depth, text, id });
    }
  });

  return entries;
}
