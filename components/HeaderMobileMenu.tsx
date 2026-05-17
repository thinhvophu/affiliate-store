"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_ITEMS, type NavItem } from "@/lib/nav-items";
import styles from "@/components/Header.module.css";

export function HeaderMobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className={styles.hamburger}
        aria-label="Mở menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="header-mobile-nav"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          className={styles.mobileNavPanel}
          role="dialog"
          aria-label="Điều hướng chính"
          id="header-mobile-nav"
        >
          <button
            type="button"
            className={styles.mobileNavClose}
            aria-label="Đóng menu"
            onClick={close}
          >
            ✕
          </button>
          <nav aria-label="Điều hướng chính">
            <ul className={styles.mobileNavList}>
              {NAV_ITEMS.map((item: NavItem) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} className={styles.mobileNavLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
