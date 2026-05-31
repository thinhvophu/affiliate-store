import GithubSlugger from "github-slugger";
import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

export function createHeadingSlugger(): { slug(text: string): string } {
  const slugger = new GithubSlugger();
  return {
    slug(text: string): string {
      return slugger.slug(text);
    },
  };
}

function nodeToText(node: Element): string {
  let out = "";
  for (const child of node.children) {
    if (child.type === "text") {
      out += child.value;
    } else if (child.type === "element") {
      out += nodeToText(child);
    }
  }
  return out;
}

export const rehypeHeadingSlugs: Plugin<[], Root> = () => (tree) => {
  const slugger = createHeadingSlugger();
  visit(tree, "element", (node) => {
    if (/^h[1-6]$/.test(node.tagName)) {
      const text = nodeToText(node);
      node.properties = node.properties ?? {};
      node.properties.id = slugger.slug(text);
    }
  });
};
