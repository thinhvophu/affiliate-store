import Link from "next/link";
import type { Metadata } from "next";
import styles from "./chinh-sach-bao-mat.module.css";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | aff-store",
  description:
    "Tìm hiểu cách aff-store thu thập dữ liệu ẩn danh qua Google Analytics, sử dụng cookie, và liên kết đến dịch vụ bên thứ ba như Shopee và Google AdSense.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/chinh-sach-bao-mat/`,
  },
};

const CONTACT_EMAIL = "ttln1201@gmail.com";

export default function ChinhSachBaoMatPage() {
  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <h1 className={styles.heading}>Chính sách bảo mật</h1>
        <p className={styles.effectiveDate}>
          Cập nhật lần cuối: 24 tháng 5, 2026
        </p>

        <p className={styles.lead}>
          Trang web aff-store ("chúng tôi") cung cấp thông tin và đánh giá sản
          phẩm gaming, công nghệ dưới hình thức tiếp thị liên kết. Chính sách
          bảo mật này mô tả cách chúng tôi xử lý thông tin khi bạn truy cập
          trang web.
        </p>

        <section className={styles.section} aria-labelledby="sec-data">
          <h2 id="sec-data" className={styles.sectionHeading}>
            1. Thông tin chúng tôi thu thập
          </h2>
          <p>
            Chúng tôi <strong>không yêu cầu tạo tài khoản</strong> và{" "}
            <strong>không thu thập thông tin cá nhân nhận dạng (PII)</strong>{" "}
            như họ tên, địa chỉ hay số điện thoại của bạn.
          </p>
          <p>
            Nếu mã đo lường Google Analytics được cấu hình (biến môi trường{" "}
            <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code>), trang web sẽ thu thập
            dữ liệu <strong>ẩn danh</strong> về hành vi duyệt web thông qua
            Google Analytics 4. Dữ liệu này bao gồm:
          </p>
          <ul className={styles.list}>
            <li>Số lượt xem trang và thời lượng phiên truy cập.</li>
            <li>Thiết bị, trình duyệt và quốc gia (không có địa chỉ IP đầy đủ).</li>
            <li>
              Sự kiện nhấp vào liên kết tiếp thị liên kết (tên sản phẩm, danh
              mục, URL đích — không gắn với danh tính cá nhân).
            </li>
          </ul>
          <p>
            Google Analytics <strong>không được tải trong môi trường phát triển</strong>{" "}
            và chỉ kích hoạt khi mã đo lường được cấu hình rõ ràng trên môi
            trường sản xuất.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-cookies">
          <h2 id="sec-cookies" className={styles.sectionHeading}>
            2. Cookie và công nghệ theo dõi
          </h2>
          <p>
            Trang web aff-store <strong>không tự đặt cookie</strong> cho mục
            đích đăng nhập hay giỏ hàng (trang không có tính năng xác thực hay
            thương mại điện tử).
          </p>
          <p>
            Các dịch vụ bên thứ ba được tích hợp (khi được kích hoạt) có thể
            đặt cookie trên trình duyệt của bạn:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>Google Analytics:</strong> cookie đo lường hành vi ẩn danh
              (ví dụ: <code>_ga</code>, <code>_gid</code>).
            </li>
            <li>
              <strong>Google AdSense:</strong> cookie phục vụ hiển thị quảng cáo
              phù hợp (nếu AdSense được kích hoạt trên trang).
            </li>
          </ul>
          <p>
            Bạn có thể kiểm soát hoặc xóa cookie thông qua cài đặt trình duyệt.
            Tắt cookie phân tích sẽ không ảnh hưởng đến khả năng sử dụng trang
            web.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-third-party">
          <h2 id="sec-third-party" className={styles.sectionHeading}>
            3. Dịch vụ bên thứ ba
          </h2>
          <p>
            Khi bạn sử dụng trang, thông tin có thể được chia sẻ với các bên
            sau:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>Shopee / Chương trình tiếp thị liên kết Shopee:</strong>{" "}
              Khi bạn nhấp vào liên kết sản phẩm, trình duyệt của bạn chuyển
              hướng đến{" "}
              <span aria-label="shope.ee hoặc shopee.vn">
                shope.ee / shopee.vn
              </span>
              . Shopee có thể đặt cookie theo dõi chuyển đổi riêng của họ. Xem{" "}
              <a
                href="https://shopee.vn/docs/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                Chính sách bảo mật của Shopee
              </a>
              .
            </li>
            <li>
              <strong>Google Analytics:</strong> Xem{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                Chính sách bảo mật của Google
              </a>
              .
            </li>
            <li>
              <strong>Google AdSense:</strong> Xem{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                Chính sách quảng cáo của Google
              </a>
              .
            </li>
          </ul>
          <p>
            Chúng tôi không kiểm soát các thực tiễn bảo mật của bên thứ ba và
            khuyến khích bạn đọc chính sách của từng dịch vụ.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-affiliate">
          <h2 id="sec-affiliate" className={styles.sectionHeading}>
            4. Liên kết tiếp thị liên kết
          </h2>
          <p>
            Trang web sử dụng các liên kết tiếp thị liên kết. Khi bạn mua hàng
            qua các liên kết này, chúng tôi có thể nhận hoa hồng mà không phát
            sinh thêm chi phí cho bạn. Để biết thêm chi tiết, vui lòng xem{" "}
            <Link
              href="/cong-bo-tiep-thi-lien-ket/"
              className={styles.internalLink}
            >
              trang Công bố tiếp thị liên kết
            </Link>{" "}
            của chúng tôi.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-contact">
          <h2 id="sec-contact" className={styles.sectionHeading}>
            5. Quyền của bạn &amp; liên hệ
          </h2>
          <p>
            Vì chúng tôi không lưu trữ thông tin cá nhân của bạn, hầu hết các
            yêu cầu truy cập, chỉnh sửa hay xóa dữ liệu liên quan đến dữ liệu
            phân tích ẩn danh do Google nắm giữ. Bạn có thể chọn không tham gia
            qua{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
            >
              tiện ích mở rộng từ chối Google Analytics
            </a>
            .
          </p>
          <p>
            Nếu bạn có câu hỏi về chính sách này, vui lòng liên hệ:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={styles.internalLink}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-changes">
          <h2 id="sec-changes" className={styles.sectionHeading}>
            6. Thay đổi chính sách
          </h2>
          <p>
            Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian để
            phản ánh thay đổi trong hoạt động hoặc yêu cầu pháp lý. Mọi thay
            đổi sẽ được đăng trên trang này kèm theo ngày cập nhật mới nhất.
            Chúng tôi khuyến khích bạn xem lại trang này định kỳ.
          </p>
        </section>
      </article>
    </div>
  );
}
