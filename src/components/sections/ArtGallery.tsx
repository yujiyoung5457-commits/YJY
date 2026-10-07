"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./ArtGallery.module.scss";

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
  const lineCanvasRef = useRef<HTMLCanvasElement>(null);

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
      className={styles.section}
      id="art-gallery"
      aria-labelledby="art-gallery-title"
    >
      {/* <div className={styles.orangePanel} aria-hidden="true" /> */}

      <div className={`${styles.galleryGroup} ${styles.firstProject}`}>
      {/* 클리핑 마스크 형태 1: 텍스트가 들어갈 아이보리색 영역 */}
      <div className={`${styles.textureShape} ${styles.shape1}`}>
        <div className={styles.projectDescription}>
          <p>
            [주요 업무]<br />React 기반 온라인 출판 서비스 관리자 대시보드를 제작했습니다.
            <br />
            방문자·회원·도서·게시판·설정 등 6개 관리 화면을 구성하고 Chart.js를
            활용한 데이터 시각화와 검색·필터·정렬·모달·슬라이드 기능을
            구현했습니다.
            <br />
            GSAP 인터랙션과 반응형 UI도 적용했습니다. <br />[활용 기술]
          </p>
          <div className={styles.projectTools} aria-label="사용 기술">
            <span className={styles.projectTool}>React</span>
            <span className={styles.projectTool}>React Router</span>
            <span className={styles.projectTool}>Chart.js</span>
            <span className={styles.projectTool}>GSAP</span>
            <span className={styles.projectTool}>SCSS Modules</span>
            <span className={styles.projectTool}>IntersectionObserver</span>
          </div>
        </div>
      </div>

      {/* 액자 + 액자 안쪽 검정 박스 1 */}
      <div className={styles.frame1}>
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
        <ProjectButtons
          className={styles.frame1Buttons}
          liveUrl="https://dash-125133337.vercel.app/"
          githubUrl="https://github.com/yujiyoung5457-commits/Dash"
        />
      </div>
      </div>

      {/* 액자 + 액자 안쪽 검정 박스 2 */}
      <div className={`${styles.galleryGroup} ${styles.mergedProject}`}>
      <div className={styles.frame2}>
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
        <ProjectButtons
          className={styles.frame2Buttons}
          liveUrl="https://memory-podo-u6zd.vercel.app/"
          githubUrl="https://github.com/yujiyoung5457-commits/MEMORY-PODO"
        />
      </div>

      {/* 클리핑 마스크 형태 2: 텍스트가 들어갈 아이보리색 영역 */}
      <div className={`${styles.textureShape} ${styles.shape2}`}>
        <div className={`${styles.projectDescription} ${styles.mergedDescription}`}>
          <h3>[주요 업무]</h3>
          <p>
            React와 Firebase를 활용해 회원 인증과 게시글·방명록 CRUD 기능을 갖춘
            캐릭터형 커뮤니티를 구현했습니다. Zustand로 사용자 및 게시글 상태를
            관리하고, 사용자별 수정·삭제 권한과 실시간 데이터 처리를 적용했습니다.
            검색·페이지네이션·드래그 갤러리·비디오 슬라이드와 SVG·CSS 애니메이션,
            마우스 추적 인터랙션 등 다양한 UI 기능을 구현했으며, 반응형 화면과
            캐릭터·시각 에셋까지 직접 제작했습니다.
          </p>
          <h3>[활용 기술]</h3>
          <p className={styles.mergedTools}>
            React · Zustand · Firebase Auth · Firestore · Firestore Security Rules ·
            React Router · SCSS Modules · SVG · IntersectionObserver · Pointer Events
          </p>
        </div>
      </div>

      {/* 액자 + 액자 안쪽 검정 박스 3 */}
      <div className={styles.frame3}>
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
        <ProjectButtons
          className={styles.frame3Buttons}
          liveUrl="https://gb-4lvk.vercel.app/"
          githubUrl="https://github.com/yujiyoung5457-commits/GB"
        />
      </div>

      </div>

      <div className={`${styles.galleryGroup} ${styles.lastProject}`}>
      {/* 클리핑 마스크 형태 4: 텍스트가 들어갈 아이보리색 영역 */}
      <div className={`${styles.textureShape} ${styles.shape4}`}>
        <div
          className={`${styles.projectDescription} ${styles.mergedDescription} ${styles.finalDescription}`}
        >
          <h3>[주요 업무]</h3>
          <p>
            HTML·CSS·JavaScript로 반응형 캐릭터 브랜드 쇼핑몰을 구현했습니다. JSON
            상품 데이터를 비동기로 불러와 상품 목록을 동적으로 생성하고, 드래그형
            슬라이더·스크롤 애니메이션·모바일 메뉴·Kakao Maps 기반 매장 안내 기능을
            제작했습니다.
          </p>
          <h3>[활용 기술]</h3>
          <div className={`${styles.projectTools} ${styles.finalProjectTools}`}>
            <span className={styles.projectTool}>HTML</span>
            <span className={styles.projectTool}>CSS</span>
            <span className={styles.projectTool}>JavaScript</span>
            <span className={styles.projectTool}>Fetch API</span>
            <span className={styles.projectTool}>JSON</span>
            <span className={styles.projectTool}>IntersectionObserver</span>
            <span className={styles.projectTool}>Pointer Events</span>
            <span className={styles.projectTool}>Kakao Maps API</span>
          </div>
        </div>
      </div>

      {/* 액자 + 액자 안쪽 검정 박스 4 */}
      <div className={styles.frame4}>
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
