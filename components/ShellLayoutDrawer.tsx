"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Drawer } from "./Drawer";
import { MOBILE_MEDIA_QUERY } from "@/lib/breakpoints";
import styles from "./ShellLayoutDrawer.module.css";

interface ShellLayoutDrawerProps {
  leftPanel: ReactNode;
  title?: string;
  triggerLabel?: string;
}

export function ShellLayoutDrawer({
  leftPanel,
  title = "Bộ lọc",
  triggerLabel = "Bộ lọc",
}: ShellLayoutDrawerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Auto-close when viewport crosses back to ≥768px (resize-while-open edge case)
  useEffect(() => {
    if (!open) return;
    const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
    const onChange = (e: MediaQueryListEvent) => {
      if (!e.matches) setOpen(false);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M3 5h14M3 10h14M3 15h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>{triggerLabel}</span>
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="left"
        labelledBy={titleId}
        triggerRef={triggerRef}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {leftPanel}
      </Drawer>
    </>
  );
}
