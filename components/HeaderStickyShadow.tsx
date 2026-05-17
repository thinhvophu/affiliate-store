"use client";

import { useEffect } from "react";

export function HeaderStickyShadow() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header[data-site-header]");
    const sentinel = document.getElementById("header-sticky-sentinel");
    if (!header || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        header.dataset.stuck = entry.isIntersecting ? "false" : "true";
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return <div id="header-sticky-sentinel" aria-hidden="true" style={{ height: 1 }} />;
}
