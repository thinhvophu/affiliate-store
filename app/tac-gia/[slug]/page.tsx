import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { PostCard } from "@/components/PostCard";
import { getAllAuthors, getAuthor, getPostAuthor } from "@/lib/authors";
import { buildAuthorBreadcrumbs, breadcrumbListJsonLd } from "@/lib/breadcrumbs";
import { METHODOLOGY_DEAL_VI, METHODOLOGY_GUIDE_VI } from "@/lib/disclosures";
import { buildPersonSchema } from "@/lib/person-schema";
import { getAllPosts } from "@/lib/posts";
import { buildCanonicalPath, buildPageMetadata } from "@/lib/seo";
import styles from "./author-page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllAuthors().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return {};

  return buildPageMetadata({
    title: author.name,
    description: author.bio[0],
    path: buildCanonicalPath(["tac-gia", author.slug]),
    ogImage: author.avatar,
  });
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const posts = getAllPosts().filter((p) => getPostAuthor(p).slug === author.slug);
  const crumbs = buildAuthorBreadcrumbs(author);

  return (
    <div className={styles.container}>
      <article>
        <JsonLd data={breadcrumbListJsonLd(crumbs)} />
        <Breadcrumb items={crumbs} />

        <header className={styles.header}>
          {author.avatar && (
            <Image
              src={author.avatar}
              alt={author.name}
              width={120}
              height={120}
              className={styles.avatar}
            />
          )}
          <div>
            <h1 className={styles.heading}>{author.name}</h1>
            {author.jobTitle && <p className={styles.jobTitle}>{author.jobTitle}</p>}
          </div>
        </header>

        <div className={styles.bio}>
          {author.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <section id="cach-chon-san-pham" className={styles.section}>
          <h2 className={styles.sectionHeading}>Cách chúng tôi chọn sản phẩm</h2>
          <p>
            <strong>Bài hướng dẫn mua hàng.</strong> {METHODOLOGY_GUIDE_VI}
          </p>
          <p>
            <strong>Tổng hợp ưu đãi hằng tuần.</strong> {METHODOLOGY_DEAL_VI}
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Bài viết của {author.name}</h2>
          <div className={styles.grid}>
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <JsonLd data={buildPersonSchema(author)} />
      </article>
    </div>
  );
}
