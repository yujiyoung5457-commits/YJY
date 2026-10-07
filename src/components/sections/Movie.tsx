"use client";

import Image from "next/image";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { WeatherAPI } from "./WeatherAPI";
import styles from "./Movie.module.scss";

const MOVIE_SLIDES = [
  {
    name: "SIMUSIMU-HAE",
    logo: "/pt_img/simusimu-hae.webp",
    logoAlt: "Simu Simu Hae",
    logoWidth: 1466,
    logoHeight: 760,
    character: "/honya.png",
    characterAlt: "Simu Simu Hae characters",
    characterWidth: 1448,
    characterHeight: 1086,
    characterClassName: styles.simuCharacter,
    video: "https://www.youtube.com/embed/ZYUeJoK_saQ?feature=oembed",
  },
  {
    name: "ULSD",
    logo: "/ulsd-logo.png",
    logoAlt: "ULSD",
    logoWidth: 1905,
    logoHeight: 825,
    character: "/ulsd-human.png",
    characterAlt: "ULSD character",
    characterWidth: 1024,
    characterHeight: 1110,
    characterClassName: styles.ulsdCharacter,
    video: "https://www.youtube.com/embed/PEjg0JYX6GM?feature=oembed",
  },
  {
    name: "BIRTHDAY",
    logo: "/birthday-logo.png",
    logoAlt: "Birthday",
    logoWidth: 1774,
    logoHeight: 887,
    character: "/birthday.png",
    characterAlt: "Birthday character",
    characterWidth: 1086,
    characterHeight: 1448,
    characterClassName: styles.birthdayCharacter,
    video: "https://www.youtube.com/embed/Cjx-TYS8KYY?feature=oembed",
  },
] as const;

export function Movie() {
  const [activeIndex, setActiveIndex] = useState(0);
  const squigglePathRef = useRef<SVGPathElement>(null);
  const activeSlide = MOVIE_SLIDES[activeIndex];

  useEffect(() => {
    const path = squigglePathRef.current;
    if (!path) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const wave = { phase: 0 };

    const drawWave = () => {
      const points = Array.from({ length: 73 }, (_, index) => {
        const x = (1440 / 72) * index;
        const distanceFromCenter = (x - 720) / 285;
        const envelope = Math.exp(-(distanceFromCenter ** 2));
        const signal =
          Math.sin(x * 0.054 + wave.phase) * 48 +
          Math.sin(x * 0.105 - wave.phase * 2) * 16;
        const y = 86 + envelope * signal;

        return { x, y };
      });

      let d = `M ${points[0].x} ${points[0].y}`;

      for (let index = 1; index < points.length - 1; index += 1) {
        const point = points[index];
        const nextPoint = points[index + 1];
        const midX = (point.x + nextPoint.x) / 2;
        const midY = (point.y + nextPoint.y) / 2;
        d += ` Q ${point.x} ${point.y} ${midX} ${midY}`;
      }

      const lastPoint = points.at(-1);
      if (lastPoint) d += ` T ${lastPoint.x} ${lastPoint.y}`;
      path.setAttribute("d", d);
    };

    drawWave();
    const tween = gsap.to(wave, {
      phase: Math.PI * 2,
      duration: 3.2,
      ease: "none",
      repeat: -1,
      onUpdate: drawWave,
    });

    return () => {
      tween.kill();
    };
  }, []);

  const showNextSlide = () => {
    setActiveIndex((current) => (current + 1) % MOVIE_SLIDES.length);
  };

  return (
    <section className={styles.section} id="contact" aria-label="Movie and contact">
      <div className={styles.intro}>
        <svg
          className={styles.squiggle}
          viewBox="0 0 1440 170"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            ref={squigglePathRef}
            d="M-30 95 C55 8 118 8 104 88 S218 154 258 82 S350 30 340 101 S438 132 493 87 S596 55 611 119 S710 151 742 77 S842 8 854 73 S953 129 1003 70 S1110 14 1123 82 S1222 141 1272 72 S1380 22 1470 89"
          />
        </svg>

        <Image
          key={activeSlide.logo}
          className={styles.logo}
          src={activeSlide.logo}
          alt={activeSlide.logoAlt}
          width={activeSlide.logoWidth}
          height={activeSlide.logoHeight}
        />
        <Image
          key={activeSlide.character}
          className={`${styles.heroCats} ${activeSlide.characterClassName}`}
          src={activeSlide.character}
          alt={activeSlide.characterAlt}
          width={activeSlide.characterWidth}
          height={activeSlide.characterHeight}
        />

        <button
          className={styles.nextSlide}
          type="button"
          onClick={showNextSlide}
          aria-label="다음 영상 보기"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className={styles.movieFrame} aria-label="Movie preview">
        <iframe
          key={activeSlide.video}
          className={styles.movie}
          src={activeSlide.video}
          title={activeSlide.name}
          aria-label={`${activeSlide.name} YouTube video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      <WeatherAPI />

      <div className={styles.contactDisc}>
        <div className={styles.contactText}>
          <a href="mailto:yujiy0303@naver.com">e-mail: yujiy0303@naver.com</a>
          <a href="tel:01054572905">Phone-number: 010-5457-2905</a>
        </div>
      </div>
    </section>
  );
}
