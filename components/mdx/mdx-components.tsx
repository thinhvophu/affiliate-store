import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import styles from "./mdx-components.module.css";

function MdxImg({
  src,
  alt,
}: {
  src?: string;
  alt?: string;
}) {
  if (!src) return null;
  return (
    <span className={styles.imgWrapper}>
      <Image
        src={src}
        alt={alt ?? ""}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 760px"
        className={styles.img}
      />
    </span>
  );
}

function ProductCardStub({ slug }: { slug?: string }) {
  return (
    <div className={styles.productCardStub} data-slug={slug}>
      [ProductCard: {slug}]
    </div>
  );
}

export function getMdxComponents(): MDXComponents {
  return {
    img: MdxImg as MDXComponents["img"],
    h1: ({ children, id }) => <h1 id={id} className={styles.h1}>{children}</h1>,
    h2: ({ children, id }) => <h2 id={id} className={styles.h2}>{children}</h2>,
    h3: ({ children, id }) => <h3 id={id} className={styles.h3}>{children}</h3>,
    h4: ({ children, id }) => <h4 id={id} className={styles.h4}>{children}</h4>,
    table: ({ children }) => (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>{children}</table>
      </div>
    ),
    th: ({ children }) => <th className={styles.th}>{children}</th>,
    td: ({ children }) => <td className={styles.td}>{children}</td>,
    ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
    ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
    li: ({ children }) => <li className={styles.li}>{children}</li>,
    blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>,
    pre: ({ children }) => <pre className={styles.pre}>{children}</pre>,
    code: ({ children }) => <code className={styles.code}>{children}</code>,
    a: ({ href, children }) => (
      <a
        href={href}
        className={styles.a}
        {...(href?.startsWith("http") ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      >
        {children}
      </a>
    ),
    ProductCard: ProductCardStub as unknown as MDXComponents[string],
  };
}
