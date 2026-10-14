"use client";

import Image from "next/image";
import { useRef } from "react";
import styles from "./IntoTheBlue.module.scss";

const ARTWORKS = [1, 2, 3, 4, 5].map((series) => ({
  src: `/artwork/${series}_1.webp`,
  alt: `Into the Blue 작품 ${series}`,
}));

export function IntoTheBlue() {
  const viewportRef = useRef<HTMLDivElement>(null);

  const moveSlide = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    const card = viewport?.querySelector<HTMLElement>("li");

    if (!viewport || !card) return;

    viewport.scrollBy({
      left: card.getBoundingClientRect().width * direction,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.section} aria-labelledby="into-the-blue-title">
      <div className={styles.inner}>
        <header className={styles.heading}>
          <p>ORIGINAL PAINTING SERIES · 05 WORLDS</p>
          <h2 id="into-the-blue-title">INTO THE BLUE</h2>
        </header>

        <div ref={viewportRef} className={styles.viewport}>
          <ul className={styles.track} aria-label="Into the Blue 작품 모음">
            {ARTWORKS.map((artwork) => (
              <li className={styles.card} key={artwork.src}>
                <div className={styles.imageFrame}>
                  <Image
                    src={artwork.src}
                    alt={artwork.alt}
                    fill
                    quality={100}
                    sizes="(max-width: 600px) 160vw, (max-width: 1024px) 60vw, 42vw"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.controls} aria-label="작품 슬라이드 제어">
          <button type="button" onClick={() => moveSlide(-1)} aria-label="이전 작품">
            PREV
          </button>
          <button type="button" onClick={() => moveSlide(1)} aria-label="다음 작품">
            NEXT
          </button>
        </div>

        <p className={styles.caption}>Five Backgrounds, One Visual World</p>
      </div>
    </section>
  );
}
