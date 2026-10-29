import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { PostBody } from "@/components/PostBody";
import { PriceDisclaimer } from "@/components/PriceDisclaimer";
import { TableOfContents } from "@/components/TableOfContents";
import { MethodologyNote } from "@/components/MethodologyNote";
import { authorPath, getPostAuthor } from "@/lib/authors";
import { postHasDeals } from "@/lib/deals";
import {
  getCategoryGuides,
  getRoundupForCategory,
  isRoundupPost,
  prioritizeGuides,
} from "@/lib/roundups";
import { getCategoryMeta } from "@/lib/categories";
import { CategoryGuides } from "@/components/CategoryGuides";
import { DealPageLink } from "@/components/DealPageLink";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { RelatedPosts } from "@/components/RelatedPosts";
import { extractToc } from "@/lib/toc";
import { formatPostDate, readingTimeVi } from "@/lib/format";
import { buildCanonicalPath, buildPageMetadata } from "@/lib/seo";
import { buildPostBreadcrumbs, breadcrumbListJsonLd } from "@/lib/breadcrumbs";
import { buildArticleSchema } from "@/lib/article-schema";
import styles from "./post-detail.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return buildPageMetadata({
    title: post.title,
    description: post.summary,
    path: buildCanonicalPath(["bai-viet", post.slug]),
    ogImage: post.coverImage,
    ogImageAlt: post.title,
    ogType: "article",
  });
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const all = getAllPosts();
  const post = all.find((p) => p.slug === slug);
  if (!post) notFound();
  const roundup = isRoundupPost(post);
  const categoryName = getCategoryMeta(post.category)?.name ?? post.category;
  const categoryGuides = roundup ? getCategoryGuides(all, post.category) : [];
  const guideSlugs = new Set(categoryGuides.map((g) => g.slug));
  const related = getRelatedPosts(post, prioritizeGuides(all)).filter(
    (p) => !guideSlugs.has(p.slug),
  );
  const toc = extractToc(post.content);
  const hasToc = toc.length > 0;
  const crumbs = buildPostBreadcrumbs(post);
  const author = getPostAuthor(post);
  const articleSchema = buildArticleSchema(post);

  return (
    <div className={hasToc ? styles.shellWithToc : styles.container}>
      {hasToc && (
        <aside className={styles.tocPanel}>
          <TableOfContents entries={toc} />
        </aside>
      )}
      <article className={hasToc ? styles.post : styles.postCentered}>
        <JsonLd data={breadcrumbListJsonLd(crumbs)} />
        <Breadcrumb items={crumbs} />
        <header className={styles.postHeader}>
          {post.coverImage && (
            <div className={styles.hero}>
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 1024px) 760px, 100vw"
                className={styles.heroImg}
              />
            </div>
          )}
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.meta}>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <span className={styles.byline}>
              Bởi <Link href={authorPath(author.slug)}>{author.name}</Link>
            </span>
            {post.updatedAt && (
              <span className={styles.updated}>
                Cập nhật ngày{" "}
                <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
              </span>
            )}
            <span className={styles.readTime}>{readingTimeVi(post.content)}</span>
          </p>
        </header>

        <AffiliateDisclosure />
        {postHasDeals(post.slug) && <PriceDisclaimer />}

        <div className={styles.prose}>
          <PostBody content={post.content} />
        </div>

        <MethodologyNote variant={roundup ? "deal" : "guide"} authorSlug={author.slug} />

        {roundup ? (
          <CategoryGuides
            heading={`Hướng dẫn chọn mua ${categoryName.toLowerCase()}`}
            guides={categoryGuides}
            categoryLink={{ href: `/danh-muc/${post.category}`, label: categoryName }}
          />
        ) : (
          <DealPageLink
            dealPost={getRoundupForCategory(all, post.category)}
            categoryName={categoryName}
          />
        )}

        <RelatedPosts posts={related} />
        <JsonLd data={articleSchema} />
      </article>
    </div>
  );
}
