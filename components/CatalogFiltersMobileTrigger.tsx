"use client";

// TODO(US00025-drawer): once <Drawer> is factored out of HeaderMobileMenu,
// replace this <dialog> wrapper with <Drawer side="left" labelledBy=…>.
import { useEffect, useRef, useState } from "react";
import { CatalogFilters } from "@/components/CatalogFilters";
import type { FilterOptions } from "@/lib/filters";
import styles from "./CatalogFiltersMobileTrigger.module.css";

interface Props {
  options: FilterOptions;
  categoryLabels?: Record<string, string>;
}

export function CatalogFiltersMobileTrigger({ options, categoryLabels }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else if (el.open) el.close();
  }, [open]);

  // Close when backdrop is clicked
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Bộ lọc
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClose={() => setOpen(false)}
        onClick={handleClick}
        aria-label="Bộ lọc sản phẩm"
      >
        <div className={styles.panel}>
          <div className={styles.header}>
            <span className={styles.title}>Bộ lọc sản phẩm</span>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Đóng bộ lọc"
            >
              ✕
            </button>
          </div>
          <div className={styles.body}>
            <CatalogFilters options={options} categoryLabels={categoryLabels} />
          </div>
        </div>
      </dialog>
    </>
  );
}
