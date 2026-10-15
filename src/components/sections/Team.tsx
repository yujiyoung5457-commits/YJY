"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Team.module.scss";

const slides = [
  {
    projectName: "L:CODE",
    title: "My Page - Event",
    previewUrl: "https://lcode-2.vercel.app/my",
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
    previewUrl: "https://tae0419.github.io/forlog2/Home/index.html",
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
      const topLeft = isTablet ? responsiveTop : height * 0.17;
      const topMiddle = isTablet
        ? headingBottom + clamp(width * 0.015, 10, 20)
        : height * 0.05;
      const topRight = isTablet
        ? headingBottom + clamp(width * 0.045, 26, 42)
        : height * 0.11;
      const technologyClearance = isTablet
        ? clamp(width * 0.075, 44, 110)
        : clamp(width * 0.035, 56, 76) + rootFontSize * 2.3;
      const bottomMiddle = Math.max(
        height * (isTablet ? 0.58 : 0.64),
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
                    {slide.previewUrl ? (
                      <iframe
                        src={slide.previewUrl}
                        title={`${slide.projectName} 사이트 미리보기`}
                        loading="lazy"
                        tabIndex={slideIndex === activeSlideIndex ? 0 : -1}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          border: 0,
                          background: "#a80000",
                        }}
                      />
                    ) : (
                      <p>사이트 모습을 보여주는 부분</p>
                    )}
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
