export type NavItem = {
  readonly label: string;
  readonly href: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Bài viết", href: "/bai-viet" },
  { label: "Về chúng tôi", href: "/ve-chung-toi" },
] as const;
