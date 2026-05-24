"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./ProductGallery.module.css";

/**
 * Product image gallery — F0004 / US00046.
 *
 * Single-image case: renders just the main image, no thumbnail row.
 * Multi-image case: renders the active image as the main slot and the full
 * image array as a thumbnail row beneath. Clicking a thumbnail swaps the
 * main image without a navigation.
 *
 * JS-off behaviour: the first image still renders as static HTML; thumbnail
 * buttons are inert but visible (spec § Edge Cases).
 */

export interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = images[activeIndex] ?? images[0];
  const isMulti = images.length > 1;

  return (
    <div className={styles.gallery}>
      <div className={styles.mainFrame}>
        <Image
          src={activeSrc}
          alt={productName}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          priority
          className={styles.mainImage}
        />
      </div>

      {isMulti && (
        <ul className={styles.thumbnails} role="list">
          {images.map((src, i) => (
            <li key={src} className={styles.thumbnailItem}>
              <button
                type="button"
                className={`${styles.thumbnailButton}${i === activeIndex ? ` ${styles.thumbnailActive}` : ""}`}
                aria-label={`Ảnh ${i + 1}`}
                aria-pressed={i === activeIndex}
                onClick={() => setActiveIndex(i)}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className={styles.thumbnailImage}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
