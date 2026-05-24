/**
 * Category registry — F0004 (US00045).
 *
 * Single source of truth for storefront category metadata. Adding a new
 * category requires:
 *   (1) adding an entry here, and
 *   (2) tagging product JSON files with the same `category` slug.
 *
 * The product loader (`lib/products.ts`) calls `assertCategoryRegistered()`
 * at build time, so any product JSON whose `category` is not registered
 * here fails `next build` with the offending slug named.
 *
 * Slug format: lowercase kebab-case ASCII (e.g. "chuot-gaming").
 */

export type CategorySlug = string;

export interface CategoryMeta {
  /** URL slug; matches `product.category` in JSON. Kebab-case ASCII. */
  slug: CategorySlug;
  /** Vietnamese display name — used in <h1> and the metadata <title>. */
  name: string;
  /** 100–200 word Vietnamese intro paragraph rendered above the grid. */
  intro: string;
  /** ≤160 char Vietnamese snippet for <meta description>. */
  metaDescription: string;
}

// 100–200 words each — enforce manually at authoring time.
export const CATEGORIES: Record<CategorySlug, CategoryMeta> = {
  "chuot-gaming": {
    slug: "chuot-gaming",
    name: "Chuột gaming",
    intro:
      "Chuột gaming là thiết bị không thể thiếu với bất kỳ game thủ nào, dù bạn chơi FPS " +
      "như Valorant, MOBA như LMHT hay MMO như World of Warcraft. Một chiếc chuột phù hợp giúp " +
      "cải thiện độ chính xác, giảm mỏi tay sau những giờ chơi dài và tăng lợi thế cạnh tranh " +
      "trong các pha phản xạ tốc độ cao. Tại aff-store, chúng tôi tổng hợp những mẫu chuột gaming " +
      "được cộng đồng game thủ Việt Nam đánh giá cao nhất hiện nay, trải dài từ phân khúc phổ thông " +
      "dưới 500.000 đồng cho đến các dòng cao cấp với cảm biến quang học đạt trên 20.000 DPI. " +
      "Mỗi sản phẩm đều được cung cấp đầy đủ thông số kỹ thuật như loại cảm biến, trọng lượng, " +
      "số nút bấm, độ bền switch và kiểu dáng cầm tay để bạn dễ dàng so sánh trước khi mua " +
      "qua liên kết Shopee tiếp thị liên kết của chúng tôi.",
    metaDescription:
      "Tổng hợp chuột gaming chính hãng giá tốt — đầy đủ thông số, đánh giá nhanh và link mua Shopee tiếp thị liên kết.",
  },

  "ban-phim-gaming": {
    slug: "ban-phim-gaming",
    name: "Bàn phím gaming",
    intro:
      "Bàn phím gaming là trung tâm của mọi trải nghiệm chơi game trên PC. Từ các dòng " +
      "membrane giá rẻ dành cho người mới bắt đầu đến bàn phím cơ (mechanical) cao cấp với switch " +
      "Cherry MX, Gateron hay Kailh, mỗi loại đều có ưu điểm riêng về phản hồi lực gõ, âm thanh " +
      "và tuổi thọ phím. Đối với game thủ FPS, switch linear như Red hay Speed Silver thường được " +
      "ưa chuộng vì phản hồi nhanh; với người gõ văn bản nhiều, switch tactile Blue hay Brown lại " +
      "phù hợp hơn. Tại aff-store, chúng tôi lựa chọn những mẫu bàn phím gaming được đánh giá " +
      "tốt nhất tại thị trường Việt Nam, bao gồm cả dòng full-size, TKL và mini 60–65%, " +
      "kèm thông tin chi tiết về loại switch, kiểu nối (có dây / không dây), hỗ trợ hot-swap " +
      "và tính năng RGB để bạn chọn được sản phẩm phù hợp nhất.",
    metaDescription:
      "Bàn phím gaming cơ, membrane giá tốt — so sánh switch, layout, RGB và link mua Shopee tiếp thị liên kết.",
  },

  "tai-nghe-gaming": {
    slug: "tai-nghe-gaming",
    name: "Tai nghe gaming",
    intro:
      "Tai nghe gaming không chỉ để nghe nhạc mà còn là công cụ định vị âm thanh quan trọng " +
      "trong các tựa game bắn súng và sinh tồn. Khả năng phân biệt tiếng bước chân, tiếng súng " +
      "hay âm thanh môi trường xung quanh có thể tạo ra sự khác biệt lớn trong kết quả mỗi ván " +
      "đấu. Tại aff-store, chúng tôi tổng hợp các mẫu tai nghe gaming từ thương hiệu uy tín như " +
      "HyperX, SteelSeries, Razer và Logitech, bao gồm cả phiên bản có dây lẫn không dây. " +
      "Mỗi sản phẩm được ghi rõ các thông số như kích thước driver, tần số đáp ứng, trọng lượng, " +
      "loại mic (detachable hay built-in) và khả năng tương thích với PC, PlayStation hay Xbox, " +
      "giúp bạn lựa chọn chiếc tai nghe phù hợp nhất với phong cách chơi và ngân sách của mình " +
      "qua link Shopee tiếp thị liên kết.",
    metaDescription:
      "Tai nghe gaming có dây và không dây giá tốt — thông số driver, mic, tương thích đa nền tảng và link Shopee.",
  },

  "man-hinh-gaming": {
    slug: "man-hinh-gaming",
    name: "Màn hình gaming",
    intro:
      "Màn hình gaming là thành phần ảnh hưởng trực tiếp đến trải nghiệm thị giác và phản xạ " +
      "của game thủ. Tần số quét cao (144Hz, 240Hz, 360Hz) giúp hình ảnh mượt mà hơn, trong khi " +
      "thời gian phản hồi thấp (1ms GtG) giảm thiểu ghosting trong các pha di chuyển tốc độ cao. " +
      "Công nghệ tấm nền IPS cho màu sắc chính xác và góc nhìn rộng, trong khi VA cho độ tương " +
      "phản cao hơn. Tại aff-store, chúng tôi tổng hợp các mẫu màn hình gaming phổ biến tại " +
      "Việt Nam với đa dạng kích thước từ 24 đến 27 inch, hỗ trợ FreeSync / G-Sync, cổng HDMI " +
      "và DisplayPort. Mỗi sản phẩm đi kèm đầy đủ thông số kỹ thuật và liên kết mua hàng qua " +
      "Shopee tiếp thị liên kết với giá cạnh tranh nhất thị trường.",
    metaDescription:
      "Màn hình gaming 144Hz, 240Hz IPS/VA giá tốt — so sánh độ phân giải, tần số quét và link mua Shopee.",
  },

  "ghe-gaming": {
    slug: "ghe-gaming",
    name: "Ghế gaming",
    intro:
      "Ghế gaming là khoản đầu tư dài hạn cho sức khỏe của game thủ, đặc biệt với những ai " +
      "ngồi chơi nhiều giờ mỗi ngày. Một chiếc ghế tốt hỗ trợ đúng tư thế ngồi, giảm áp lực " +
      "lên cột sống lưng dưới và giúp bạn duy trì sự tập trung lâu hơn. Ghế gaming hiện đại " +
      "thường có thiết kế bucket-seat lấy cảm hứng từ xe đua, với đệm ngồi bọc PU leather hay " +
      "fabric, tựa đầu và gối lưng có thể tháo rời, tay vựa 3D/4D điều chỉnh linh hoạt và " +
      "cơ chế ngả lưng có khóa góc độ. Tại aff-store, chúng tôi giới thiệu những mẫu ghế gaming " +
      "được đánh giá cao về độ bền, khả năng hỗ trợ thắt lưng và mức giá hợp lý, kèm link " +
      "mua hàng tiện lợi qua Shopee tiếp thị liên kết.",
    metaDescription:
      "Ghế gaming ergonomic giá tốt — so sánh chất liệu, khả năng điều chỉnh và link mua Shopee tiếp thị liên kết.",
  },
};

export function getCategoryMeta(slug: string): CategoryMeta | undefined {
  return CATEGORIES[slug];
}

export function getAllCategorySlugs(): CategorySlug[] {
  return Object.keys(CATEGORIES);
}

/** Returns a slug → Vietnamese display name map for use in filter UIs. */
export function getCategoryLabels(): Record<string, string> {
  return Object.fromEntries(Object.entries(CATEGORIES).map(([slug, meta]) => [slug, meta.name]));
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Build-time guard. Called from `lib/products.ts` during JSON validation.
 * Fails the build with a clear error if a product references an unknown
 * category or if the category slug shape is invalid.
 */
export function assertCategoryRegistered(category: string, productSlug: string): void {
  if (!SLUG_REGEX.test(category)) {
    throw new Error(
      `[categories] Product "${productSlug}" has invalid category slug ` +
        `"${category}". Slugs must be lowercase kebab-case ASCII.`,
    );
  }
  if (!(category in CATEGORIES)) {
    throw new Error(
      `[categories] Product "${productSlug}" references unknown category ` +
        `"${category}". Register it in lib/categories.ts first.`,
    );
  }
}
