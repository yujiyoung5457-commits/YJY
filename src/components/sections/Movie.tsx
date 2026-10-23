"use client";

import Image from "next/image";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
    logoClassName: styles.simuLogo,
    character: "/honya.png",
    characterAlt: "Simu Simu Hae characters",
    characterWidth: 1448,
    characterHeight: 1086,
    characterClassName: styles.simuCharacter,
    video: "https://www.youtube.com/embed/ZYUeJoK_saQ?feature=oembed",
    summary:
      "Clip Studio Paint로 2D 애니메이션을 직접 제작하고, Paint 3D에서 캐릭터를 모델링했습니다.",
    description:
      "기존 무료 3D 배경 에셋을 재구성하고 Adobe Premiere Pro에서 영상 합성 및 사운드 편집을 진행한 약 3분 분량의 작품입니다.",
    tools: ["Clip Studio Paint", "Premiere Pro", "Microsoft Paint 3D"],
  },
  {
    name: "ULSD",
    logo: "/ulsd-logo.png",
    logoAlt: "ULSD",
    logoWidth: 1905,
    logoHeight: 825,
    logoClassName: styles.ulsdLogo,
    character: "/ulsd-human.png",
    characterAlt: "ULSD character",
    characterWidth: 1024,
    characterHeight: 1110,
    characterClassName: styles.ulsdCharacter,
    video: "https://www.youtube.com/embed/PEjg0JYX6GM?feature=oembed",
    summary:
      "Clip Studio Paint를 활용해 약 11분 분량의 2D 애니메이션을 단독 제작했습니다.",
    description:
      "Adobe Premiere Pro로 장면을 구성하고 최종 영상을 편집했습니다.",
    tools: ["Clip Studio Paint", "Premiere Pro"],
  },
  {
    name: "BIRTHDAY",
    logo: "/birthday-logo.png",
    logoAlt: "Birthday",
    logoWidth: 1774,
    logoHeight: 887,
    logoClassName: styles.birthdayLogo,
    character: "/birthday.png",
    characterAlt: "Birthday character",
    characterWidth: 1086,
    characterHeight: 1448,
    characterClassName: styles.birthdayCharacter,
    video: "https://www.youtube.com/embed/Cjx-TYS8KYY?feature=oembed",
    summary:
      "스톱모션 기법과 콜라주, 디지털 2D 애니메이션을 결합한 혼합매체 영상 작품입니다.",
    description:
      "Clip Studio Paint에서 디지털 애니메이션을 제작하고 Adobe Premiere Pro에서 영상 요소들을 합성·편집했습니다.",
    tools: ["Clip Studio Paint", "Premiere Pro"],
  },
] as const;

export function Movie() {
  const [activeIndex, setActiveIndex] = useState(0);
  const squigglePathRef = useRef<SVGPathElement>(null);
  const contactDiscRef = useRef<HTMLDivElement>(null);
  const contactPathRef = useRef<SVGPathElement>(null);
  const contactArtworkRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const contactDisc = contactDiscRef.current;
    const path = contactPathRef.current;
    const artwork = contactArtworkRef.current;

    if (!contactDisc || !path || !artwork) return;

    gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

    const motionPath = {
      path,
      align: path,
      alignOrigin: [0.5, 0.5],
      autoRotate: true,
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      gsap.set(artwork, {
        autoAlpha: 1,
        motionPath: { ...motionPath, start: 0.5, end: 0.5 },
      });
      return () => gsap.set(artwork, { clearProps: "transform,opacity,visibility" });
    }

    gsap.set(artwork, {
      autoAlpha: 1,
      motionPath: { ...motionPath, start: 0, end: 0 },
    });

    const tween = gsap.to(artwork, {
      duration: 8,
      ease: "none",
      repeat: -1,
      repeatDelay: 1.5,
      motionPath: { ...motionPath, start: 0, end: 1 },
      scrollTrigger: {
        trigger: contactDisc,
        start: "top bottom",
        end: "bottom top",
        toggleActions: "play pause resume pause",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const showNextSlide = () => {
    setActiveIndex((current) => (current + 1) % MOVIE_SLIDES.length);
  };

  return (
    <section className={styles.section} id="contact" aria-label="Movie and contact">
      <div className={styles.showcase}>
        <div className={styles.mediaColumn}>
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
              className={`${styles.logo} ${activeSlide.logoClassName}`}
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
        </div>

        <aside className={styles.details} aria-live="polite">
          <Image
            className={styles.detailsCircle}
            src="/AnotherCircle.svg"
            alt=""
            fill
            sizes="(min-width: 769px) min(32vw, 520px), 0px"
          />
          <div className={styles.detailsContent}>
            <h2>{activeSlide.name}</h2>
            <p>{activeSlide.summary}</p>
            <p>{activeSlide.description}</p>
            <ul aria-label={`${activeSlide.name} 기술 스택`}>
              {activeSlide.tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <WeatherAPI />

      <div ref={contactDiscRef} className={styles.contactDisc}>
        <svg
          className={styles.contactMotionGuide}
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <path
            ref={contactPathRef}
            d="M 116 820 A 500 500 0 1 1 884 820"
          />
        </svg>

        <div ref={contactArtworkRef} className={styles.contactArtwork} aria-hidden="true">
          <Image src="/lastArtwork.svg" alt="" width={227} height={118} />
        </div>

        <div className={styles.contactText}>
          <a href="mailto:yujiy0303@naver.com">e-mail: yujiyeong5457@gmail.com</a>
          <a href="tel:01054572905">Phone-number: 010-5457-2905</a>
        </div>
      </div>
    </section>
  );
}
