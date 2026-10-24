import Link from "next/link";

export default function AuthorNotFound() {
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
        Tác giả không tồn tại
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--spacing-xl)" }}>
        Trang tác giả bạn đang tìm không có trên trang web.
      </p>
      <Link
        href="/bai-viet"
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
        Xem tất cả bài viết
      </Link>
    </div>
  );
}
