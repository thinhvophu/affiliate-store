import Link from "next/link";
import type { Metadata } from "next";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { CONTACT_EMAIL } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import styles from "./ve-chung-toi.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "Về chúng tôi",
  description:
    "aff-store là trang đánh giá và gợi ý mua sắm thiết bị gaming, công nghệ tại Việt Nam. Tìm hiểu sứ mệnh, đội ngũ và cách chúng tôi chọn sản phẩm để giới thiệu.",
  path: "/ve-chung-toi/",
});

export default function VeChungToiPage() {
  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <h1 className={styles.heading}>Về chúng tôi</h1>

        <p className={styles.lead}>
          aff-store là trang đánh giá và đề xuất sản phẩm gaming, công nghệ bằng
          tiếng Việt — được vận hành độc lập, tập trung vào nội dung thực tế và
          minh bạch.
        </p>

        <section className={styles.section} aria-labelledby="sec-mission">
          <h2 id="sec-mission" className={styles.sectionHeading}>
            Sứ mệnh của aff-store
          </h2>
          <p>
            aff-store ra đời với mục tiêu giúp người dùng Việt{" "}
            <strong>chọn đúng sản phẩm gaming và công nghệ ngay từ lần mua đầu tiên</strong>{" "}
            — tiết kiệm thời gian tra cứu, tránh mua nhầm, và không bị cuốn theo những
            lời quảng cáo phóng đại.
          </p>
          <p>
            Chúng tôi tin rằng một bài đánh giá tốt phải{" "}
            <strong>viết bằng tiếng Việt, dành cho người Việt</strong>: đặt sản phẩm
            trong bối cảnh giá cả, độ phổ biến và chính sách hậu mãi tại thị trường
            Việt Nam, thay vì dịch máy móc từ các bài review nước ngoài. Mỗi bài viết
            trên aff-store đều cố gắng trả lời rõ ba câu hỏi:{" "}
            <strong>&#8220;Sản phẩm này hợp với ai?&#8221;</strong>,{" "}
            <strong>&#8220;Đáng tiền ở mức giá nào?&#8221;</strong>, và{" "}
            <strong>&#8220;Có lựa chọn nào tốt hơn không?&#8221;</strong>.
          </p>
          <p>
            Trang được duy trì miễn phí cho người đọc. Chi phí vận hành đến từ hoa
            hồng tiếp thị liên kết khi bạn mua qua các liên kết Shopee trên trang —
            không thu phí, không yêu cầu đăng ký, không có nội dung trả phí ẩn.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-who">
          <h2 id="sec-who" className={styles.sectionHeading}>
            Chúng tôi là ai
          </h2>
          <p>
            aff-store là một{" "}
            <strong>dự án cá nhân, vận hành độc lập</strong> bởi một nhóm nhỏ những
            người yêu công nghệ và chơi game tại Việt Nam. Chúng tôi không trực thuộc
            Shopee, không thuộc bất kỳ nhãn hàng nào, và cũng không nhận tài trợ để
            viết bài.
          </p>
          <p>
            Người vận hành trang trực tiếp{" "}
            <strong>mua, thử nghiệm và theo dõi cộng đồng người dùng</strong> cho từng
            nhóm sản phẩm trước khi đưa vào danh sách đề xuất. Khi chúng tôi chưa có
            điều kiện tự trải nghiệm một sản phẩm, bài viết sẽ ghi rõ rằng nội dung
            được tổng hợp từ phản hồi cộng đồng và thông số chính thức — chứ không
            &#8220;đóng vai&#8221; một bài đánh giá tay.
          </p>
          <p>
            Mọi câu hỏi, góp ý hoặc đính chính từ bạn đọc đều được chúng tôi tiếp
            nhận trực tiếp qua email liên hệ (xem mục Liên hệ ở chân trang).
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-how-we-pick">
          <h2 id="sec-how-we-pick" className={styles.sectionHeading}>
            Cách chúng tôi chọn sản phẩm
          </h2>
          <p>
            Một sản phẩm xuất hiện trên aff-store khi nó đáp ứng đồng thời các tiêu
            chí sau:
          </p>
          <ol className={styles.list}>
            <li>
              <strong>Có sẵn trên Shopee Việt Nam</strong> với người bán uy tín, chính
              sách đổi trả rõ ràng, và mã sản phẩm ổn định theo thời gian.
            </li>
            <li>
              <strong>Mức giá hợp lý so với hiệu năng</strong> trong tầm giá — chúng
              tôi ưu tiên các lựa chọn &#8220;đáng tiền&#8221; thay vì chỉ chạy theo
              flagship.
            </li>
            <li>
              <strong>Có phản hồi thực tế từ cộng đồng người dùng Việt</strong> (đánh
              giá Shopee, các nhóm/diễn đàn chuyên ngành) chứ không chỉ dựa vào tài
              liệu của nhà sản xuất.
            </li>
            <li>
              <strong>Phù hợp với một nhu cầu cụ thể</strong> — ví dụ &#8220;chuột
              gaming dưới 500k cho FPS&#8221; — chứ không phải gom sản phẩm cho đủ số
              lượng.
            </li>
          </ol>
          <p>
            Thứ tự sản phẩm trong bài viết và trang danh mục được sắp xếp dựa trên{" "}
            <strong>giá trị thực tế cho người dùng</strong>, không dựa trên mức hoa
            hồng tiếp thị liên kết. Không có nhãn hàng nào trả tiền để sản phẩm của
            họ được ưu tiên hiển thị.
          </p>
          <p>
            Khi giá thị trường, chính sách bán hàng hoặc cộng đồng đánh giá có thay
            đổi đáng kể, chúng tôi sẽ cập nhật lại bài viết và ghi rõ ngày cập nhật.
            Nếu bạn phát hiện một đề xuất đã lỗi thời hoặc chưa chính xác, rất mong
            nhận được phản hồi qua email liên hệ.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-disclosure">
          <h2 id="sec-disclosure" className={styles.sectionHeading}>
            Công bố tiếp thị liên kết
          </h2>
          <AffiliateDisclosure />
          <p className={styles.disclosureMore}>
            Đọc đầy đủ tại{" "}
            <Link href="/cong-bo-tiep-thi-lien-ket/" className={styles.internalLink}>
              Công bố tiếp thị liên kết
            </Link>
            .
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-contact">
          <h2 id="sec-contact" className={styles.sectionHeading}>
            Liên hệ
          </h2>
          <p>
            Mọi câu hỏi, góp ý, hay đề xuất sản phẩm, mời bạn gửi email cho chúng tôi tại{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={styles.internalLink}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
