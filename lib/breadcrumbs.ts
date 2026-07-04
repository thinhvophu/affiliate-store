import { getCategoryMeta } from "@/lib/categories";
import { NAV_ITEMS } from "@/lib/nav-items";
import type { Product } from "@/types";
import type { Post } from "@/types";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

const ROOT_CRUMB: BreadcrumbItem = { label: "Trang chủ", href: "/" };

const PRODUCTS_CRUMB: BreadcrumbItem = {
  label: NAV_ITEMS.find((n) => n.href === "/san-pham")!.label,
  href: "/san-pham/",
};

const POSTS_CRUMB: BreadcrumbItem = {
  label: NAV_ITEMS.find((n) => n.href === "/bai-viet")!.label,
  href: "/bai-viet/",
};

export function buildProductBreadcrumbs(product: Product): BreadcrumbItem[] {
  const cat = getCategoryMeta(product.category);
  const items: BreadcrumbItem[] = [ROOT_CRUMB, PRODUCTS_CRUMB];
  if (cat) items.push({ label: cat.name, href: `/danh-muc/${cat.slug}/` });
  items.push({ label: product.name, href: `/san-pham/${product.slug}/` });
  return items;
}

export function buildCategoryBreadcrumbs(categorySlug: string): BreadcrumbItem[] {
  const cat = getCategoryMeta(categorySlug);
  if (!cat) return [ROOT_CRUMB, PRODUCTS_CRUMB];
  return [
    ROOT_CRUMB,
    PRODUCTS_CRUMB,
    { label: cat.name, href: `/danh-muc/${cat.slug}/` },
  ];
}

export function buildPostBreadcrumbs(post: Post): BreadcrumbItem[] {
  const cat = getCategoryMeta(post.category);
  const items: BreadcrumbItem[] = [ROOT_CRUMB, POSTS_CRUMB];
  if (cat) items.push({ label: cat.name, href: `/danh-muc/${cat.slug}/` });
  items.push({ label: post.title, href: `/bai-viet/${post.slug}/` });
  return items;
}
