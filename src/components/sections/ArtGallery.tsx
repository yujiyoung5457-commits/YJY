"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import styles from "./ArtGallery.module.scss";

type ScaledObjectProps = {
  children: ReactNode;
  className: string;
  designWidth: number;
  designHeight: number;
};

function ScaledObject({
  children,
  className,
  designWidth,
  designHeight,
}: ScaledObjectProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateScale = () => {
      const scale = Math.min(1, wrapper.getBoundingClientRect().width / designWidth);
      wrapper.style.setProperty("--object-scale", String(scale));
    };

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(wrapper);
    updateScale();

    return () => resizeObserver.disconnect();
  }, [designWidth]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.scaledObject} ${className}`}
      style={
        {
          "--object-design-width": `${designWidth}px`,
          "--object-design-height": `${designHeight}px`,
          aspectRatio: `${designWidth} / ${designHeight}`,
        } as CSSProperties
      }
    >
      <div className={styles.scaledObjectInner}>{children}</div>
    </div>
  );
}

type ProjectButtonsProps = {
  className: string;
  liveUrl: string;
  githubUrl: string;
};

function ProjectButtons({ className, liveUrl, githubUrl }: ProjectButtonsProps) {
  return (
    <div className={`${styles.buttons} ${className}`}>
      <a href={liveUrl} target="_blank" rel="noreferrer">
        Live Site
      </a>
      <a href={githubUrl} target="_blank" rel="noreferrer">
        Git Hub
      </a>
    </div>
  );
}

const bookSlides = [
  "/book.png",
  "/book01.png",
  "/book02.png",
] as const;

const memoryPodoSlides = ["/memory-podo.png", "/memoryPodo-01.png"] as const;

const cloudCrudSlides = [
  "/cloud-CRUD.png",
  "/cloud-CRUD01.png",
  "/cloud-CRUD02.png",
] as const;

const mergedProjectTools = [
  "React",
  "Zustand",
  "Firebase Auth",
  "Firestore",
  "Firestore Security Rules",
  "React Router",
  "SCSS Modules",
  "SVG",
  "IntersectionObserver",
  "Pointer Events",
] as const;

type FrameSliderProps = {
  images: readonly string[];
  alt: string;
};

function FrameSlider({ images, alt }: FrameSliderProps) {
  const loopingSlides = [...images, images[0]];
  const trackClassName =
    images.length === 2 ? styles.twoSlideTrack : styles.threeSlideTrack;

  return (
    <div className={styles.frameSlider} aria-label={`${alt} 슬라이드`}>
      <div className={`${styles.frameSliderTrack} ${trackClassName}`}>
        {loopingSlides.map((image, index) => (
          <div className={styles.frameSlide} key={`${image}-${index}`}>
            <Image
              src={image}
              alt={index === 0 ? alt : ""}
              fill
              sizes="(max-width: 768px) 72vw, 45vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArtGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const revealItems = Array.from(
      section.querySelectorAll<HTMLElement>("[data-gallery-reveal]"),
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add(styles.revealVisible));
      return;
    }

    section.classList.add(styles.revealReady);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add(styles.revealVisible);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      section.classList.remove(styles.revealReady);
    };
  }, []);

  useEffect(() => {
    const canvas = lineCanvasRef.current;

    if (!canvas) return;

    const drawLine = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);

      const context = canvas.getContext("2d");

      if (!context) return;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle =
        getComputedStyle(canvas).getPropertyValue("--color-blue").trim() || "#060a7b";

      const sourceWidth = 3012.21;
      const sourceHeight = 11201.24;
      const curveEndPercent = Number.parseFloat(
        getComputedStyle(canvas).getPropertyValue("--curve-end-x"),
      );
      const curveEndRatio = Number.isFinite(curveEndPercent)
        ? curveEndPercent / 100
        : 0.586;
      const lineLeft = width * curveEndRatio;
      const scaleX = (width - lineLeft) / sourceWidth;
      const scaleY = height / sourceHeight;
      const x = (value: number) => lineLeft + value * scaleX;
      const y = (value: number) => value * scaleY;

      context.beginPath();
      context.moveTo(x(820.61), y(0));
      context.bezierCurveTo(
        x(820.61),
        y(0),
        x(634.93),
        y(1405.9),
        x(720.47),
        y(2305.79),
      );
      context.bezierCurveTo(
        x(806.01),
        y(3205.68),
        x(1171),
        y(4374.54),
        x(920.07),
        y(5597.95),
      );
      context.bezierCurveTo(
        x(669.14),
        y(6821.36),
        x(235.72),
        y(7642.59),
        x(30.41),
        y(9832.53),
      );
      context.bezierCurveTo(
        x(30.41),
        y(9832.53),
        x(-38.03),
        y(10448.45),
        x(30.41),
        y(11201.24),
      );
      context.lineTo(width, height);
      context.lineTo(width, 0);
      context.closePath();
      context.fill();
      context.strokeStyle = context.fillStyle;
      context.lineWidth = 2;
      context.lineJoin = "round";
      context.stroke();
    };

    const resizeObserver = new ResizeObserver(drawLine);
    resizeObserver.observe(canvas);
    drawLine();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="art-gallery"
      aria-labelledby="art-gallery-title"
    >
      {/* <div className={styles.orangePanel} aria-hidden="true" /> */}

      <div className={`${styles.galleryGroup} ${styles.firstProject}`}>
      {/* 클리핑 마스크 형태 1: 텍스트가 들어갈 아이보리색 영역 */}
      <ScaledObject className={styles.shape1Object} designWidth={605} designHeight={1008}>
      <div
        className={`${styles.textureShape} ${styles.shape1} ${styles.revealFromLeft}`}
        data-gallery-reveal
      >
        <div className={`${styles.projectDescription} ${styles.bookDescription}`}>
          <p className={styles.bookEyebrow}>Selected Project / 03</p>
          <h3 className={styles.bookTitle}>Book.JS</h3>
          <p className={styles.bookSubtitle}>Library Admin Dashboard</p>
          <p className={styles.bookLead}>
            도서와 사용자를 한눈에 관리하는
            <br />
            온라인 출판 서비스 관리자 대시보드
          </p>
          <span className={styles.bookDivider} aria-hidden="true" />
          <p className={styles.bookSummary}>
            React 기반의 6개 관리 화면을 구현하고 데이터 시각화와
            검색·필터·정렬 기능을 적용했습니다.
          </p>
          <div
            className={`${styles.projectTools} ${styles.bookTools}`}
            aria-label="사용 기술"
          >
            <span className={styles.projectTool}>React</span>
            <span className={styles.projectTool}>React Router</span>
            <span className={styles.projectTool}>Chart.js</span>
            <span className={styles.projectTool}>GSAP</span>
            <span className={styles.projectTool}>SCSS Modules</span>
            <span className={styles.projectTool}>IntersectionObserver</span>
          </div>
        </div>
      </div>
      </ScaledObject>

      {/* 액자 + 액자 안쪽 검정 박스 1 */}
      <div
        className={`${styles.frame1} ${styles.revealFromRight}`}
        data-gallery-reveal
      >
        <ScaledObject className={styles.frame1Object} designWidth={700} designHeight={933}>
        <div className={`${styles.frame} ${styles.frame1Frame}`}>
          <div
            className={`${styles.frameWindow} ${styles.frame1Window}`}
            aria-label="작품 이미지 영역 1"
          />
          <FrameSlider images={bookSlides} alt="Book.JS 프로젝트 화면" />
          <Image
            className={styles.frameBorder}
            src="/pt_img/frame02.webp"
            alt=""
            fill
            sizes="28vw"
          />
        </div>
        </ScaledObject>
        <ProjectButtons
          className={styles.frame1Buttons}
          liveUrl="https://dash-125133337.vercel.app/"
          githubUrl="https://github.com/yujiyoung5457-commits/Dash"
        />
      </div>
      </div>

      {/* 액자 + 액자 안쪽 검정 박스 2 */}
      <div className={`${styles.galleryGroup} ${styles.mergedProject}`}>
      <div
        className={`${styles.frame2} ${styles.revealFromLeft}`}
        data-gallery-reveal
      >
        <ScaledObject className={styles.frame2Object} designWidth={778} designHeight={584}>
        <div className={`${styles.frame} ${styles.frame2Frame}`}>
          <div
            className={`${styles.frameWindow} ${styles.frame2Window}`}
            aria-label="작품 이미지 영역 2"
          />
          <FrameSlider images={memoryPodoSlides} alt="Memory Podo 프로젝트 화면" />
          <Image
            className={styles.frameBorder}
            src="/pt_img/frame01.webp"
            alt=""
            fill
            sizes="65rem"
          />
        </div>
        </ScaledObject>
        <ProjectButtons
          className={styles.frame2Buttons}
          liveUrl="https://memory-podo-u6zd.vercel.app/"
          githubUrl="https://github.com/yujiyoung5457-commits/MEMORY-PODO"
        />
      </div>

      {/* 클리핑 마스크 형태 2: 텍스트가 들어갈 아이보리색 영역 */}
      <ScaledObject className={styles.shape2Object} designWidth={864} designHeight={490}>
      <div
        className={`${styles.textureShape} ${styles.shape2} ${styles.revealFromRight}`}
        data-gallery-reveal
      >
        <div
          className={`${styles.projectDescription} ${styles.mergedDescription} ${styles.communityDescription}`}
        >
          <p className={styles.communityEyebrow}>Selected Project / 04</p>
          <h3 className={styles.communityTitle}>Memory PODO &amp; Cloud CRUD</h3>
          <p className={styles.communitySubtitle}>Character Community</p>
          <p className={styles.communityLead}>
            캐릭터와 인터랙션을 결합한 참여형 커뮤니티 웹 서비스
          </p>
          <span className={styles.communityDivider} aria-hidden="true" />
          <p className={styles.communitySummary}>
            React·Firebase 기반 커뮤니티에 회원 인증, CRUD 및 사용자별 권한 관리를
            구현했습니다.
            <br />
            Zustand 상태 관리와 검색·페이지네이션·드래그 갤러리 등 인터랙티브 UI를
            적용했습니다.
          </p>
          <div
            className={`${styles.projectTools} ${styles.mergedTools} ${styles.communityTools}`}
            aria-label="활용 기술 목록"
          >
            {mergedProjectTools.map((technology) => (
              <span className={styles.projectTool} key={technology}>
                {technology}
              </span>
            ))}
          </div>
        </div>
      </div>
      </ScaledObject>

      {/* 액자 + 액자 안쪽 검정 박스 3 */}
      <div
        className={`${styles.frame3} ${styles.revealFromLeft}`}
        data-gallery-reveal
      >
        <ScaledObject className={styles.frame3Object} designWidth={446} designHeight={595}>
        <div className={`${styles.frame} ${styles.frame3Frame}`}>
          <div
            className={`${styles.frameWindow} ${styles.frame3Window}`}
            aria-label="작품 이미지 영역 3"
          />
          <FrameSlider images={cloudCrudSlides} alt="Guestbook Cloud 프로젝트 화면" />
          <Image
            className={styles.frameBorder}
            src="/pt_img/frame02.webp"
            alt=""
            fill
            sizes="28vw"
          />
        </div>
        </ScaledObject>
        <ProjectButtons
          className={styles.frame3Buttons}
          liveUrl="https://gb-4lvk.vercel.app/"
          githubUrl="https://github.com/yujiyoung5457-commits/GB"
        />
      </div>

      </div>

      <div className={`${styles.galleryGroup} ${styles.lastProject}`}>
      {/* 클리핑 마스크 형태 4: 텍스트가 들어갈 아이보리색 영역 */}
      <ScaledObject className={styles.shape4Object} designWidth={792} designHeight={688}>
      <div
        className={`${styles.textureShape} ${styles.shape4} ${styles.revealFromLeft}`}
        data-gallery-reveal
      >
        <div
          className={`${styles.projectDescription} ${styles.mergedDescription} ${styles.finalDescription} ${styles.piyoDescription}`}
        >
          <p className={styles.piyoEyebrow}>Selected Project / 05</p>
          <h3 className={styles.piyoTitle}>Piyo-Plush</h3>
          <p className={styles.piyoSubtitle}>Character Shopping Mall</p>
          <span className={styles.piyoDivider} aria-hidden="true" />
          <p className={styles.piyoSummary}>
            JSON 기반 동적 상품 목록과 드래그 슬라이더·스크롤 인터랙션을
            구현했습니다.
            <br />
            반응형 UI와 Kakao Maps API를 활용한 매장 안내 기능을 적용했습니다.
          </p>
          <div
            className={`${styles.projectTools} ${styles.finalProjectTools} ${styles.piyoTools}`}
            aria-label="활용 기술 목록"
          >
            <span className={styles.projectTool}>HTML</span>
            <span className={styles.projectTool}>CSS</span>
            <span className={styles.projectTool}>JavaScript</span>
            <span className={styles.projectTool}>Fetch API</span>
            <span className={styles.projectTool}>JSON</span>
            <span className={styles.piyoToolBreak} aria-hidden="true" />
            <span className={styles.projectTool}>IntersectionObserver</span>
            <span className={styles.projectTool}>Pointer Events</span>
            <span className={styles.projectTool}>Kakao Maps API</span>
          </div>
        </div>
      </div>
      </ScaledObject>

      {/* 액자 + 액자 안쪽 검정 박스 4 */}
      <div
        className={`${styles.frame4} ${styles.revealFromRight}`}
        data-gallery-reveal
      >
        <ScaledObject className={styles.frame4Object} designWidth={520} designHeight={693}>
        <div className={`${styles.frame} ${styles.frame4Frame}`}>
          <div
            className={`${styles.frameWindow} ${styles.frame4Window}`}
            aria-label="작품 이미지 영역 4"
          />
          <Image
            className={styles.frameBorder}
            src="/pt_img/frame02.webp"
            alt=""
            fill
            sizes="28vw"
          />
        </div>
        </ScaledObject>
        <ProjectButtons
          className={styles.frame4Buttons}
          liveUrl="https://yujiyoung5457-commits.github.io/piyo/"
          githubUrl="https://github.com/yujiyoung5457-commits/piyo"
        />
      </div>
      </div>

      <canvas ref={lineCanvasRef} className={styles.line} aria-hidden="true" />
    </section>
  );
}
