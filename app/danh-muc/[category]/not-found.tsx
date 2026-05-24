import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <section style={{ padding: "var(--spacing-xl, 48px) 0" }}>
      <h1>Không tìm thấy danh mục</h1>
      <p>Danh mục bạn tìm không tồn tại hoặc đã được gỡ khỏi cửa hàng.</p>
      <p style={{ marginTop: "var(--spacing-md, 16px)" }}>
        <Link href="/san-pham/" style={{ color: "var(--color-primary, #ee4d2d)" }}>
          Xem tất cả sản phẩm
        </Link>
      </p>
    </section>
  );
}
