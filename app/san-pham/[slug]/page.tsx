import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AffiliateLink } from "@/components/AffiliateLink";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { ProductGallery } from "@/components/ProductGallery";
import { RelatedProducts } from "@/components/RelatedProducts";
import { getAllProducts, getRelatedProducts } from "@/lib/products";
import { formatVnd } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo";
import { buildProductBreadcrumbs } from "@/lib/breadcrumbs";
import { buildProductSchema } from "@/lib/product-schema";
import styles from "./product-detail.module.css";

/**
 * Product detail page — F0004 / US00046.
 *
 * Statically generated per product slug. Renders the canonical detail view:
 *   - <h1>{name}</h1>
 *   - brand, formatted price
 *   - image gallery (single- or multi-image via <ProductGallery>)
 *   - short description
 *   - specs <dl> (omitted entirely when product.specs is empty)
 *   - prominent "Mua trên Shopee" <AffiliateLink> CTA
 *   - <RelatedProducts products={related} /> section (US00047)
 *
 * No <ShellLayout /> — the page uses a full-width container inside <main>
 * (Scenario 8). Header + Footer come from app/layout.tsx.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getAllProducts().find((p) => p.slug === slug);
  if (!product) return {};

  return buildPageMetadata({
    title: product.name,
    description: product.description,
    path: `/san-pham/${product.slug}/`,
    ogImage: product.images[0],
    ogImageAlt: product.name,
    ogType: "article",
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const all = getAllProducts();
  const product = all.find((p) => p.slug === slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, all);
  const specEntries = Object.entries(product.specs);
  const crumbs = buildProductBreadcrumbs(product);
  const productSchema = buildProductSchema(product);

  return (
    <div className={styles.container}>
      <JsonLd data={productSchema} />
      <Breadcrumb items={crumbs} />
      <article className={styles.detail}>
        <div className={styles.galleryColumn}>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <div className={styles.infoColumn}>
          <p className={styles.brand}>{product.brand}</p>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>{formatVnd(product.price)}</p>

          <AffiliateLink
            className={styles.ctaButton}
            href={product.affiliateUrl}
            productName={product.name}
            productCategory={product.category}
          >
            <span className={styles.ctaLabel}>Mua trên Shopee</span>
          </AffiliateLink>

          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}

          {specEntries.length > 0 && (
            <section
              className={styles.specsSection}
              aria-labelledby="product-specs-heading"
            >
              <h2 id="product-specs-heading" className={styles.sectionHeading}>
                Thông số kỹ thuật
              </h2>
              <dl className={styles.specsList}>
                {specEntries.map(([key, value]) => (
                  <div key={key} className={styles.specRow}>
                    <dt className={styles.specKey}>{key}</dt>
                    <dd className={styles.specValue}>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </article>

      <RelatedProducts products={related} />
    </div>
  );
}
