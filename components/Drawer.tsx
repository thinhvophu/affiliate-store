"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import styles from "./Drawer.module.css";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  labelledBy: string;
  triggerRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export function Drawer({
  open,
  onClose,
  side = "left",
  labelledBy,
  triggerRef,
  children,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Body scroll lock — simple overflow:hidden + scrollbar-width compensation
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) {
      document.body.style.paddingRight = `${scrollbarW}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  // Focus management: move focus in on open; restore to trigger on close
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const trigger = triggerRef.current;

    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0] ?? closeButtonRef.current;
    first?.focus();

    return () => {
      trigger?.focus();
    };
  }, [open, triggerRef]);

  // Focus trap: Tab / Shift+Tab cycles within the drawer
  const onKeyDownPanel = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);

    if (focusables.length === 0) {
      e.preventDefault();
      closeButtonRef.current?.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={`${styles.root}${open ? ` ${styles.open}` : ""}`}
      aria-hidden={!open}
    >
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`${styles.panel} ${styles[`panel--${side}`]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onKeyDown={onKeyDownPanel}
        tabIndex={-1}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
