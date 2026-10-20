import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { LEGACY_ROUNDUP_REDIRECTS } from "./lib/redirects";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  async redirects() {
    return [...LEGACY_ROUNDUP_REDIRECTS];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
