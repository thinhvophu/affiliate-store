import Link from "next/link";
import type { Metadata } from "next";
import { AFFILIATE_DISCLOSURE_VI } from "@/lib/disclosures";
import { CONTACT_EMAIL } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "Công bố tiếp thị liên kết",
  description:
    "aff-store sử dụng liên kết tiếp thị liên kết Shopee. Chúng tôi có thể nhận hoa hồng khi bạn mua hàng, không phát sinh thêm chi phí cho bạn. Tìm hiểu thêm về cam kết minh bạch của chúng tôi.",
  path: "/cong-bo-tiep-thi-lien-ket/",
});

export default function CongBoTiepThiLienKetPage() {
  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <h1 className={styles.heading}>Công bố tiếp thị liên kết</h1>

        <p className={styles.lead}>{AFFILIATE_DISCLOSURE_VI}</p>

        <section className={styles.section} aria-labelledby="sec-shopee">
          <h2 id="sec-shopee" className={styles.sectionHeading}>
            1. Quan hệ tiếp thị liên kết với Shopee
          </h2>
          <p>
            aff-store tham gia{" "}
            <a
              href="https://affiliate.shopee.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
            >
              Chương trình tiếp thị liên kết của Shopee
            </a>
            . Khi bạn nhấp vào liên kết sản phẩm trên trang này và thực hiện
            mua hàng, chúng tôi có thể nhận được một khoản hoa hồng từ Shopee.
          </p>
          <p>
            Các liên kết tiếp thị liên kết được nhận diện qua địa chỉ{" "}
            <span aria-label="shope.ee hoặc shopee.vn">
              shope.ee / shopee.vn
            </span>{" "}
            và mở ra trong tab mới để bạn không bị rời khỏi trang. Khi bạn
            nhấp, trình duyệt của bạn sẽ được chuyển hướng qua URL theo dõi
            của Shopee, giúp Shopee ghi nhận rằng lượt truy cập xuất phát từ
            trang của chúng tôi.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-no-cost">
          <h2 id="sec-no-cost" className={styles.sectionHeading}>
            2. Không phát sinh thêm chi phí cho bạn
          </h2>
          <p>
            Khoản hoa hồng chúng tôi nhận được do{" "}
            <strong>Shopee chi trả</strong>, không phải do người mua. Giá sản
            phẩm hiển thị trên Shopee <strong>không thay đổi</strong> dù bạn
            mua qua liên kết tiếp thị liên kết hay truy cập Shopee trực tiếp.
            Bạn luôn được hưởng cùng mức giá, cùng chương trình khuyến mãi và
            cùng chính sách đổi trả như mọi khách hàng khác.
          </p>
          <p>
            Nói cách khác, sử dụng liên kết từ aff-store là cách bạn ủng hộ
            trang web này tiếp tục hoạt động mà không phải bỏ thêm một đồng
            nào.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-transparency">
          <h2 id="sec-transparency" className={styles.sectionHeading}>
            3. Tính minh bạch và cam kết biên tập
          </h2>
          <p>
            Chúng tôi cam kết rằng các đề xuất sản phẩm trên aff-store được
            lựa chọn dựa trên <strong>giá trị thực tế</strong> — hiệu năng,
            mức giá, và phản hồi từ cộng đồng người dùng — chứ không dựa trên
            mức hoa hồng hay quan hệ trả phí với nhãn hàng. Không có nhà sản
            xuất hay đơn vị bán lẻ nào trả tiền để sản phẩm của họ xuất hiện
            trong bài đánh giá hay danh sách đề xuất.
          </p>
          <p>
            Hoa hồng tiếp thị liên kết giúp chúng tôi duy trì trang web và
            tiếp tục tạo ra nội dung miễn phí, hữu ích bằng tiếng Việt về các
            sản phẩm gaming và công nghệ. Sự ủng hộ của bạn rất có ý nghĩa với
            chúng tôi.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="sec-privacy">
          <h2 id="sec-privacy" className={styles.sectionHeading}>
            4. Thông tin liên quan
          </h2>
          <p>
            Để hiểu rõ hơn về cách chúng tôi xử lý dữ liệu khi bạn truy cập
            trang, vui lòng đọc{" "}
            <Link href="/chinh-sach-bao-mat/" className={styles.internalLink}>
              Chính sách bảo mật
            </Link>{" "}
            của chúng tôi. Nếu bạn có câu hỏi về chương trình tiếp thị liên
            kết, vui lòng liên hệ qua email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={styles.internalLink}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
