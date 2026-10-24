import Link from "next/link";
import { authorPath } from "@/lib/authors";
import { METHODOLOGY_DEAL_VI, METHODOLOGY_GUIDE_VI } from "@/lib/disclosures";
import styles from "./MethodologyNote.module.css";

interface MethodologyNoteProps {
  variant: "guide" | "deal";
  authorSlug: string;
}

export function MethodologyNote({ variant, authorSlug }: MethodologyNoteProps) {
  return (
    <aside className={styles.note} aria-label="Cách chúng tôi chọn sản phẩm">
      <p className={styles.text}>
        {variant === "deal" ? METHODOLOGY_DEAL_VI : METHODOLOGY_GUIDE_VI}{" "}
        <Link href={`${authorPath(authorSlug)}#cach-chon-san-pham`} className={styles.link}>
          Xem cách chúng tôi chọn sản phẩm
        </Link>
      </p>
    </aside>
  );
}
