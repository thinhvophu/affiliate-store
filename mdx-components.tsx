import type { MDXComponents } from "mdx/types";
import { getMdxComponents } from "@/components/mdx/mdx-components";

export function useMDXComponents(): MDXComponents {
  return getMdxComponents();
}
