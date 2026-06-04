import Link from "next/link";

export default function PostNotFound() {
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
        Bài viết không tồn tại
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--spacing-xl)" }}>
        Bài viết bạn đang tìm kiếm không có trên trang web hoặc đã bị gỡ xuống.
      </p>
      <Link
        href="/bai-viet/"
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
