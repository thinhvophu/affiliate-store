import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { rehypeHeadingSlugs } from "@/lib/mdx-slug";
import { getMdxComponents } from "@/components/mdx/mdx-components";
import styles from "./PostBody.module.css";

export async function PostBody({ content }: { content: string }) {
  const { default: MDXContent } = await evaluate(content, {
    ...(runtime as Parameters<typeof evaluate>[1]),
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHeadingSlugs],
    useMDXComponents: getMdxComponents,
  });

  return (
    <div className={styles.prose}>
      <MDXContent />
    </div>
  );
}
