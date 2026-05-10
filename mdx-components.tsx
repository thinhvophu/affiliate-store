import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  // F0003 will register <ProductCard /> here.
  // F0006 may add base typography overrides (h1, img, …).
};

export function useMDXComponents(): MDXComponents {
  return components;
}
