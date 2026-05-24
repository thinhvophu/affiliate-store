import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import { getAllCategorySlugs, getCategoryMeta } from "@/lib/categories";
import { ShellLayout } from "@/components/ShellLayout";
import { CategoryNav } from "@/components/CategoryNav";
import { CategoryPageClient } from "@/components/CategoryPageClient";
import styles from "./category-page.module.css";

type Params = { category: string };

export function generateStaticParams(): Params[] {
  return getAllCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  const meta = getCategoryMeta(category);
  if (!meta) return {};

  // Use no-trailing-slash canonical (trailingSlash: false is the Next.js default).
  // Pages 2+ append ?page=N — handled client-side; metadata reflects page 1 canonical.
  return {
    title: `${meta.name} | aff-store`,
    description: meta.metaDescription,
    alternates: { canonical: `/danh-muc/${meta.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;

  const meta = getCategoryMeta(category);
  if (!meta) notFound();

  const all = getAllProducts();
  const filtered = all
    .filter((p) => p.category === category)
    .sort((a, b) => {
      const dt =
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return dt !== 0 ? dt : a.slug.localeCompare(b.slug);
    });

  return (
    <ShellLayout leftPanel={<CategoryNav currentSlug={meta.slug} />}>
      <article>
        <header className={styles.header}>
          <h1 className={styles.heading}>{meta.name}</h1>
          <p className={styles.intro}>{meta.intro}</p>
        </header>

        <CategoryPageClient products={filtered} categorySlug={meta.slug} />
      </article>
    </ShellLayout>
  );
}
