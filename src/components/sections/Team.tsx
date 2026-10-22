"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import forLogScreenshot01 from "../../../public/follogscreenshot01.jpg";
import forLogScreenshot02 from "../../../public/follogscreenshot02.jpg";
import forLogScreenshot03 from "../../../public/follogscreenshot03.jpg";
import forLogScreenshot04 from "../../../public/follogscreenshot04.jpg";
import forLogScreenshot05 from "../../../public/follogscreenshot05.jpg";
import forLogScreenshot06 from "../../../public/follogscreenshot06.jpg";
import lcodeScreenshot01 from "../../../public/locodescreenshot01.jpg";
import lcodeScreenshot02 from "../../../public/locodescreenshot02.jpg";
import lcodeScreenshot03 from "../../../public/locodescreenshot03.jpg";
import lcodeScreenshot04 from "../../../public/locodescreenshot04.jpg";
import lcodeScreenshot05 from "../../../public/locodescreenshot05.jpg";
import lcodeScreenshot06 from "../../../public/locodescreenshot06.jpg";
import midnightChordScreenshot01 from "../../../public/midnightchordscreenshot01.jpg";
import midnightChordScreenshot02 from "../../../public/midnightchordscreenshot02.jpg";
import midnightChordScreenshot03 from "../../../public/midnightchordscreenshot03.jpg";
import midnightChordScreenshot04 from "../../../public/midnightchordscreenshot04.jpg";
import midnightChordScreenshot05 from "../../../public/midnightchordscreenshot05.jpg";
import midnightChordScreenshot06 from "../../../public/midnightchordscreenshot06.jpg";
import styles from "./Team.module.scss";

const FOR_LOG_SCREENSHOTS = [
  forLogScreenshot01,
  forLogScreenshot02,
  forLogScreenshot03,
  forLogScreenshot04,
  forLogScreenshot05,
  forLogScreenshot06,
] as const;

const LCODE_SCREENSHOTS = [
  lcodeScreenshot01,
  lcodeScreenshot02,
  lcodeScreenshot03,
  lcodeScreenshot04,
  lcodeScreenshot05,
  lcodeScreenshot06,
] as const;

const MIDNIGHT_CHORD_SCREENSHOTS = [
  midnightChordScreenshot01,
  midnightChordScreenshot02,
  midnightChordScreenshot03,
  midnightChordScreenshot04,
  midnightChordScreenshot05,
  midnightChordScreenshot06,
] as const;

const slides = [
  {
    projectName: "L:CODE",
    title: "My Page - Event",
    previewScreenshots: LCODE_SCREENSHOTS,
    summary: [
      "마이페이지 사용자 흐름을 설계하고 Firebase를 연동해 회원정보·일정·찜·후기·구매·쿠폰 기능을 구현했습니다.",
      "여행 밸런스 게임과 가챠·매거진 이벤트 페이지를 제작하고, 반응형 UI와 다양한 사용자 인터랙션을 구현했습니다.",
    ],
    troubleshooting:
      "Firebase 인증 과정에서 발생하는 오류 코드를 사용자 친화적인 한국어 메시지로 변환하여 로그인 오류의 이해도를 개선했습니다.",
    technologies: [
      "React",
      "React Router",
      "SCSS Modules",
      "Firebase Auth",
      "Firestore",
      "Cloud Functions",
    ],
  },
  {
    projectName: "FOR LOG",
    title: "Home Page",
    previewScreenshots: FOR_LOG_SCREENSHOTS,
    summary: [
      "FOR-LOG의 대표 HOME 페이지 UI/UX 디자인과 프론트엔드 구현을 담당했습니다. 오리지널 캐릭터 ‘초로기’를 직접 디자인하고",
      "HTML·CSS·JavaScript를 활용해 반응형 레이아웃과 Canvas 인트로, 스크롤 애니메이션, 3D 카드, 리뷰 슬라이더, 이벤트 팝업 등 다양한 인터랙션을 구현했습니다.",
    ],
    troubleshooting:
      "GitHub 협업 중 발생한 코드 충돌을 해결하고 작업 전 git pull을 통한 코드 동기화로 충돌 재발을 줄였습니다.",
    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "jQuery",
      "Canvas API",
      "IntersectionObserver",
      "Adobe Illustrator",
    ],
  },
  {
    projectName: "Midnight Chord",
    title: "Artists & Playlist Page",
    previewScreenshots: MIDNIGHT_CHORD_SCREENSHOTS,
    summary: [
      "Artist 목록·상세 페이지와 Playlist 영역의 UI 및 인터랙션을 구현했습니다. 아티스트 검색·페이지네이션·음악 재생·팔로우 기능과 드래그형 플레이리스트 캐러셀, 재생 컨트롤, 최근 재생 목록 및 모달 기능을 개발했습니다.",
    ],
    troubleshooting:
      "팀원 간 공통 JSON 파일 사용으로 발생한 데이터 충돌을 해결하기 위해 파일을 개별 분리하고, 독립적으로 관리할 수 있도록 구조를 개선했습니다.",
    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "LocalStorage",
      "HTMLAudioElement",
      "Pointer Events",
    ],
  },
] as const;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

export function Team() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const technologiesRef = useRef<HTMLParagraphElement>(null);

  const showPreviousSlide = () => {
    setActiveSlideIndex((currentIndex) =>
      currentIndex === 0 ? slides.length - 1 : currentIndex - 1,
    );
  };

  const showNextSlide = () => {
    setActiveSlideIndex((currentIndex) => (currentIndex + 1) % slides.length);
  };

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = waveCanvasRef.current;
    const heading = headingRef.current;
    const technologyLine = technologiesRef.current;

    if (!section || !canvas || !heading || !technologyLine) return;

    const drawWave = () => {
      const sectionBounds = section.getBoundingClientRect();
      const headingBounds = heading.getBoundingClientRect();
      const technologyBounds = technologyLine.getBoundingClientRect();
      const { width, height } = sectionBounds;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const context = canvas.getContext("2d");

      if (!context || width === 0 || height === 0) return;

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle =
        getComputedStyle(section).getPropertyValue("--team-surface").trim() ||
        "#ffaa00";

      const isTablet = width <= 900;
      const rootFontSize =
        Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const headingBottom = headingBounds.bottom - sectionBounds.top;
      const technologyTop = technologyBounds.top - sectionBounds.top;
      const responsiveTop = headingBottom + clamp(width * 0.035, 20, 36);
     const topLeft = isTablet ? responsiveTop : height * 0.25;
const topMiddle = isTablet
  ? headingBottom + clamp(width * 0.015, 10, 20)
  : height * 0.13;
const topRight = isTablet
  ? headingBottom + clamp(width * 0.045, 26, 42)
  : height * 0.19;
      const technologyClearance = isTablet
        ? clamp(width * 0.075, 44, 110)
        : clamp(width * 0.035, 56, 76) + rootFontSize * 2.3;
      const bottomMiddle = Math.max(
        height * (isTablet ? 0.58 : 0.55),
        technologyTop - technologyClearance,
      );
      const bottomCurveDepth = clamp(width * 0.065, 28, 92);
      const bottomLeft = bottomMiddle - bottomCurveDepth;
      const bottomRight = bottomMiddle - bottomCurveDepth * 0.35;

      context.beginPath();
      context.moveTo(0, topLeft);
      context.bezierCurveTo(
        width * 0.26,
        isTablet ? topLeft + bottomCurveDepth * 0.55 : height * 0.24,
        width * 0.47,
        topMiddle - height * 0.025,
        width * 0.66,
        topMiddle,
      );
      context.bezierCurveTo(
        width * 0.82,
        topMiddle + height * 0.01,
        width * 0.91,
        topRight + height * 0.04,
        width,
        topRight,
      );
      context.lineTo(width, bottomRight);
      context.bezierCurveTo(
        width * 0.87,
        bottomMiddle + height * 0.035,
        width * 0.69,
        bottomMiddle - height * 0.01,
        width * 0.56,
        bottomMiddle,
      );
      context.bezierCurveTo(
        width * 0.39,
        bottomMiddle,
        width * 0.27,
        bottomMiddle + height * 0.045,
        width * 0.16,
        bottomMiddle + height * 0.035,
      );
      context.bezierCurveTo(
        width * 0.08,
        bottomMiddle + height * 0.02,
        width * 0.035,
        bottomLeft - height * 0.015,
        0,
        bottomLeft,
      );
      context.closePath();
      context.fill();
    };

    const resizeObserver = new ResizeObserver(drawWave);
    resizeObserver.observe(section);
    drawWave();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="team-contributions"
      aria-labelledby="team-contributions-title"
    >
      <canvas ref={waveCanvasRef} className={styles.waveCanvas} aria-hidden="true" />

      <div className={styles.inner}>
        <h2 ref={headingRef} className={styles.heading} id="team-contributions-title">
          My Contributions
        </h2>

        <div style={{ position: "relative" }}>
          <div style={{ overflow: "hidden" }}>
            <div
              aria-live="polite"
              style={{
                display: "flex",
                transform: `translateX(-${activeSlideIndex * 100}%)`,
                transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform",
              }}
            >
              {slides.map((slide, slideIndex) => (
                <div
                key={slide.projectName}
                aria-hidden={slideIndex !== activeSlideIndex}
                style={{
                  minWidth: 0,
                  flex: "0 0 100%",
                  pointerEvents: slideIndex === activeSlideIndex ? "auto" : "none",
                }}
              >
                <div className={styles.content}>
                  <div className={styles.previewPlaceholder}>
                    <div
                      className={styles.previewSlideshow}
                      role="img"
                      aria-label={`${slide.projectName} 주요 화면 미리보기`}
                    >
                      {slide.previewScreenshots.map(
                        (screenshot, screenshotIndex) => (
                          <Image
                            key={screenshot.src}
                            className={styles.previewSlide}
                            src={screenshot}
                            alt=""
                            fill
                            sizes="(max-width: 900px) 100vw, 46vw"
                            style={{
                              animationDelay: `${screenshotIndex * 5 - 1}s`,
                            }}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <article className={styles.description}>
                    <p className={styles.projectName}>{slide.projectName}</p>
                    <h3>{slide.title}</h3>

                    <div className={styles.summary}>
                      {slide.summary.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    <div className={styles.troubleshooting}>
                      <h4>Troubleshooting</h4>
                      <p>{slide.troubleshooting}</p>
                    </div>
                  </article>
                </div>

                <p
                  ref={slideIndex === activeSlideIndex ? technologiesRef : undefined}
                  className={styles.technologies}
                  aria-label={`${slide.projectName} 사용 기술`}
                >
                  {slide.technologies.map((technology, technologyIndex) => (
                    <span key={technology}>
                      {technologyIndex > 0 && <span aria-hidden="true"> · </span>}
                      {technology}
                    </span>
                  ))}
                </p>
              </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="이전 팀 프로젝트"
            onClick={showPreviousSlide}
            style={{
              position: "absolute",
              zIndex: 2,
              top: "35%",
              left: "-2rem",
              display: "grid",
              width: "clamp(2.75rem, 4vw, 4rem)",
              aspectRatio: "1",
              padding: 0,
              placeItems: "center",
              border: 0,
              borderRadius: "50%",
              background: "#060a7b",
              color: "#fcf6eb",
              fontFamily: "var(--font-anton), Impact, sans-serif",
              fontSize: "clamp(2rem, 3vw, 3rem)",
              lineHeight: 1,
              cursor: "pointer",
              transform: "translateY(-50%)",
            }}
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="다음 팀 프로젝트"
            onClick={showNextSlide}
            style={{
              position: "absolute",
              zIndex: 2,
              top: "35%",
              right: "-2rem",
              display: "grid",
              width: "clamp(2.75rem, 4vw, 4rem)",
              aspectRatio: "1",
              padding: 0,
              placeItems: "center",
              border: 0,
              borderRadius: "50%",
              background: "#060a7b",
              color: "#fcf6eb",
              fontFamily: "var(--font-anton), Impact, sans-serif",
              fontSize: "clamp(2rem, 3vw, 3rem)",
              lineHeight: 1,
              cursor: "pointer",
              transform: "translateY(-50%)",
            }}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
