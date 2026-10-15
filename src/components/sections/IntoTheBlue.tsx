"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./IntoTheBlue.module.scss";

const ARTWORKS = [
  {
    series: 1,
    images: [1, 4, 6, 7, 9, 10, 12, 14, 15, 17, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31],
    landscape: [4, 6, 7, 9, 15, 17, 22, 23, 25, 27, 28],
  },
  {
    series: 2,
    images: [1, 3, 6, 7, 10, 12, 13, 15, 16, 17, 20, 21, 23, 24, 25, 28, 29, 31, 33, 34, 36, 39, 40, 43, 44, 46, 47, 48, 49],
    landscape: [1, 3, 6, 20, 21, 23, 24, 29, 34, 43, 44, 46, 49],
  },
  {
    series: 3,
    images: [1, 2, 6, 7, 10, 15, 18, 20, 21, 23, 24, 25, 26, 28, 29, 31, 33, 37, 38, 40, 41, 42, 44, 47, 49, 50, 52, 53],
    landscape: [2, 6, 7, 10, 15, 20, 23, 24, 25, 26, 28, 29, 31, 37, 40, 41, 42, 44, 47, 52],
  },
  {
    series: 4,
    images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 27, 30, 31, 32, 33, 37, 38, 40, 41, 42, 44, 46, 48, 49, 50, 51, 52, 53, 55, 56, 57],
    landscape: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 17, 18, 20, 27, 33, 37, 38, 40, 44, 46, 48, 51, 52],
  },
  {
    series: 5,
    images: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19, 21, 23, 24, 25, 27, 28, 29, 30, 32, 33, 34, 35, 36, 39, 40, 41, 42, 43, 44, 45, 47, 49],
    landscape: [1, 2, 3, 4, 5, 6, 11, 15, 16, 21, 23, 24, 25, 27, 32, 33, 34, 35, 36, 39, 40, 41, 42, 43, 44, 45, 47],
  },
].map((artwork) => ({
  ...artwork,
  src: `/artwork/${artwork.series}_1.webp`,
  alt: `Into the Blue 작품 ${artwork.series}`,
}));

const getArtworkSrc = (series: number, imageNumber: number) =>
  `/artwork/${series}_${imageNumber}.webp`;

export function IntoTheBlue() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [activeSeries, setActiveSeries] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeArtwork = ARTWORKS.find(
    (artwork) => artwork.series === activeSeries,
  );
  const activeImageNumber = activeArtwork?.images[activeIndex];
  const isLandscape =
    activeImageNumber !== undefined &&
    activeArtwork?.landscape.includes(activeImageNumber);

  useEffect(() => {
    if (activeSeries === null) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveSeries(null);
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [activeSeries]);

  const moveSlide = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    const card = viewport?.querySelector<HTMLElement>("li");

    if (!viewport || !card) return;

    viewport.scrollBy({
      left: card.getBoundingClientRect().width * direction,
      behavior: "smooth",
    });
  };

  const openModal = (series: number) => {
    setActiveIndex(0);
    setActiveSeries(series);
  };

  const moveModal = (direction: -1 | 1) => {
    if (!activeArtwork) return;

    setActiveIndex((current) =>
      (current + direction + activeArtwork.images.length) %
      activeArtwork.images.length,
    );
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
                <button
                  className={styles.artworkButton}
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={`${artwork.series}번 작품 이미지 모음 열기`}
                  onClick={() => openModal(artwork.series)}
                >
                  <span className={styles.imageFrame}>
                    <Image
                      src={artwork.src}
                      alt={artwork.alt}
                      fill
                      quality={100}
                      sizes="(max-width: 600px) 160vw, (max-width: 1024px) 60vw, 42vw"
                    />
                  </span>
                </button>
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

      {activeArtwork &&
        activeImageNumber !== undefined &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={styles.modalOverlay}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setActiveSeries(null);
            }}
          >
            <div
              className={`${styles.modalDialog} ${
                isLandscape ? styles.landscapeModal : styles.portraitModal
              }`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="into-the-blue-modal-title"
            >
              <h3 id="into-the-blue-modal-title" className={styles.srOnly}>
                Into the Blue {activeArtwork.series}번 작품 이미지 모음
              </h3>

              <button
                ref={closeButtonRef}
                className={styles.closeButton}
                type="button"
                aria-label="이미지 모음 닫기"
                onClick={() => setActiveSeries(null)}
              >
                ×
              </button>

              <div className={styles.modalMain}>
                <button
                  className={`${styles.modalArrow} ${styles.previousArrow}`}
                  type="button"
                  aria-label="이전 이미지"
                  onClick={() => moveModal(-1)}
                >
                  ‹
                </button>

                <div className={styles.modalImageFrame}>
                  <Image
                    src={getArtworkSrc(activeArtwork.series, activeImageNumber)}
                    alt={`${activeArtwork.series}번 작품 이미지 ${activeImageNumber}`}
                    fill
                    quality={100}
                    sizes={isLandscape ? "80vw" : "(max-width: 600px) 88vw, 38vw"}
                  />
                </div>

                <button
                  className={`${styles.modalArrow} ${styles.nextArrow}`}
                  type="button"
                  aria-label="다음 이미지"
                  onClick={() => moveModal(1)}
                >
                  ›
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
