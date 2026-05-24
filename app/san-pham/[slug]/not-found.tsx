import Link from "next/link";

/**
 * Vietnamese 404 surface for unknown product slugs — F0004 / US00046.
 * Rendered by Next.js when notFound() is called in page.tsx.
 * Header + Footer come from app/layout.tsx (root layout wraps this).
 */
export default function ProductNotFound() {
  return (
    <div
      style={{
        maxWidth: "var(--max-width, 1280px)",
        margin: "0 auto",
        padding: "var(--spacing-2xl) var(--spacing-md)",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "var(--spacing-md)" }}>
        Sản phẩm không tồn tại
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--spacing-xl)" }}>
        Sản phẩm bạn đang tìm kiếm không có trên trang web hoặc đã bị gỡ xuống.
      </p>
      <Link
        href="/san-pham/"
        style={{
          display: "inline-block",
          padding: "var(--spacing-sm) var(--spacing-lg)",
          background: "var(--color-primary)",
          color: "var(--color-on-primary)",
          borderRadius: "var(--radius-md)",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Xem tất cả sản phẩm
      </Link>
    </div>
  );
}
