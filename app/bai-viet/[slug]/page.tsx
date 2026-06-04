import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { PostBody } from "@/components/PostBody";
import { TableOfContents } from "@/components/TableOfContents";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { RelatedPosts } from "@/components/RelatedPosts";
import { extractToc } from "@/lib/toc";
import { formatPostDate } from "@/lib/format";
import { SITE_NAME } from "@/lib/site";
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `${siteUrl}/bai-viet/${slug}/`,
    },
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const all = getAllPosts();
  const post = all.find((p) => p.slug === slug);
  if (!post) notFound();
  const related = getRelatedPosts(post, all);
  const toc = extractToc(post.content);
  const hasToc = toc.length > 0;

  return (
    <div className={hasToc ? styles.shellWithToc : styles.container}>
      {hasToc && (
        <aside className={styles.tocPanel}>
          <TableOfContents entries={toc} />
        </aside>
      )}
      <article className={hasToc ? styles.post : styles.postCentered}>
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
            <span className={styles.byline}>{SITE_NAME}</span>
          </p>
        </header>

        <AffiliateDisclosure />

        <div className={styles.prose}>
          <PostBody content={post.content} />
        </div>

        <RelatedPosts posts={related} />
      </article>
    </div>
  );
}
