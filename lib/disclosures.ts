/**
 * Canonical Vietnamese affiliate disclosure, mandated by CLAUDE.md "Required disclosures".
 * Must appear in the footer of every page (rendered by `components/Footer.tsx`)
 * AND at the top of every blog post (rendered by F0006 post template).
 *
 * Do not edit this string without updating CLAUDE.md in the same commit.
 */
export const AFFILIATE_DISCLOSURE_VI =
  "Các liên kết sản phẩm trên trang này là liên kết tiếp thị liên kết. Chúng tôi có thể nhận hoa hồng khi bạn mua hàng qua các liên kết này, không phát sinh thêm chi phí cho bạn.";

/**
 * Price-may-have-changed disclaimer, mandated for every weekly deal-roundup
 * post (F0015/US00152, spec §2). Rendered alongside AFFILIATE_DISCLOSURE_VI
 * by `components/PriceDisclaimer.tsx`, gated on `postHasDeals()` so ordinary
 * buying-guide posts are unaffected.
 *
 * Do not edit this string without updating CLAUDE.md in the same commit.
 */
export const PRICE_CHANGE_DISCLAIMER_VI =
  "Giá và mức giảm trong bài được ghi nhận tại thời điểm đăng bài và có thể đã thay đổi khi bạn xem. " +
  "Vui lòng kiểm tra giá cuối cùng trên Shopee trước khi đặt mua.";

/**
 * Methodology notes shown at the end of every post (F0016/US00166). The guide
 * variant covers hands-on-researched buying guides; the deal variant is honest
 * that weekly roundup picks follow Shopee's ranking and were not tested.
 */
export const METHODOLOGY_GUIDE_VI =
  "Các sản phẩm trong bài được chọn dựa trên thông số chính thức, đánh giá thực tế của người dùng Việt và mức giá trên Shopee, không dựa trên mức hoa hồng.";

export const METHODOLOGY_DEAL_VI =
  "Các ưu đãi trong bài được chọn theo bảng xếp hạng của Shopee (mức giảm giá, đánh giá và lượt bán). Chúng tôi chưa trực tiếp kiểm tra các sản phẩm này.";
