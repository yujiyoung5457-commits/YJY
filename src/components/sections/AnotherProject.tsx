"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./AnotherProject.module.scss";

const VISIBLE_TECH_COUNT = 5;

const projectDetails = {
  flower: {
    title: "Flower Dance",
    eyebrow: "Project 01 · Shopping Mall",
    summary: "캐릭터 기반 반응형 쇼핑몰",
    liveUrl: "https://flower-dance-sigma.vercel.app/",
    task:
      "자체 제작 캐릭터를 활용한 반응형 쇼핑몰을 기획·구현했습니다. React와 Firebase를 연동해 회원·상품·찜·장바구니·주문·관리자 기능을 제작하고, 상품 검색·필터·재고 관리와 포토존·Kakao Maps 등 인터랙티브 기능을 구현했습니다.",
    tech: [
      "React",
      "React Router",
      "Zustand",
      "SCSS Modules",
      "Firebase Auth",
      "Firestore",
      "Canvas",
      "IndexedDB",
      "Kakao Maps API",
    ],
  },
  hamster: {
    title: "I love hamster",
    eyebrow: "Project 02 · Care Game",
    summary: "햄스터 육성·방 꾸미기 웹앱",
    liveUrl: "https://hamster-olive-mu.vercel.app/",
    task:
      "Next.js·TypeScript 기반으로 햄스터 육성 및 방 꾸미기 웹앱을 구현했습니다. Firebase를 활용해 사용자 인증과 햄스터 이름·호감도·레벨 데이터를 관리하고, PC·모바일 드래그 앤 드롭과 상태별 캐릭터 반응·퀘스트 시스템을 제작했습니다. 캐릭터와 아이템 에셋도 직접 디자인했습니다.",
    tech: [
      "Next.js",
      "TypeScript",
      "Firebase Auth",
      "Firestore",
      "SCSS Modules",
      "GSAP",
      "Pointer Events",
      "Adobe Illustrator",
    ],
  },
} as const;

type ProjectKey = keyof typeof projectDetails;

type ScaledCircleProps = {
  children: ReactNode;
  className: string;
  designSize: number;
};

function ScaledCircle({ children, className, designSize }: ScaledCircleProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateScale = () => {
      const scale = Math.min(1, wrapper.getBoundingClientRect().width / designSize);
      wrapper.style.setProperty("--card-scale", String(scale));
    };

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(wrapper);
    updateScale();

    return () => resizeObserver.disconnect();
  }, [designSize]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.scaledCircle} ${className}`}
      style={{ "--card-design-size": `${designSize}px` } as CSSProperties}
    >
      <div className={styles.scaledCircleInner}>{children}</div>
    </div>
  );
}

export function AnotherProject() {
  const [selectedProject, setSelectedProject] = useState<ProjectKey>("flower");
  const [clickedProject, setClickedProject] = useState<ProjectKey | null>(null);
  const activeProject = clickedProject ?? selectedProject;
  const selectedDetails = projectDetails[activeProject];
  const visibleTech = selectedDetails.tech.slice(0, VISIBLE_TECH_COUNT);
  const remainingTechCount = selectedDetails.tech.length - visibleTech.length;

  const previewProject = (project: ProjectKey, pointerType: string) => {
    if (pointerType === "mouse" && clickedProject === null) {
      setSelectedProject(project);
    }
  };

  const selectProject = (project: ProjectKey) => {
    setSelectedProject(project);
    setClickedProject(project);
  };

  return (
    <section
      className={styles.section}
      id="another-project"
      aria-labelledby="another-project-title"
    >
      <div className={styles.wave} aria-hidden="true">
        <Image
          className={styles.waveImage}
          src="/pt_img/power02.svg"
          alt=""
          width={7289}
          height={3931}
        />
      </div>

      <h2 className={styles.title} id="another-project-title">
        Another Project
      </h2>

      <Image
        className={styles.artwork}
        src="/pt_img/el05.svg"
        alt=""
        width={152}
        height={204}
      />

      <ScaledCircle className={styles.flowerCircle} designSize={1280}>
      <button
        type="button"
        className={styles.projectCard}
        onPointerEnter={(event) => previewProject("flower", event.pointerType)}
        onClick={() => selectProject("flower")}
        aria-label="Flower Dance 프로젝트 정보 보기"
        aria-pressed={activeProject === "flower"}
      >
        <Image
          className={styles.projectCardBackground}
          src="/AnotherCircle.svg"
          alt=""
          fill
          sizes="80rem"
        />
        <div className={`${styles.mobilePreview} ${styles.shoppingPreview}`}>
          <Image
            src="/reactShoppingmall-cotti.webp"
            alt=""
            fill
            sizes="(max-width: 375px) 70vw, 1px"
          />
        </div>
        <div className={styles.imagePlaceholder} aria-hidden="true" />
        <h3>
          Shopping
          <br />
          Mall
        </h3>
      </button>
      </ScaledCircle>

      <ScaledCircle className={styles.descriptionCircle} designSize={560}>
      <article className={styles.projectDescription} aria-live="polite">
        <Image
          className={styles.projectDescriptionBackground}
          src="/AnotherCircle.svg"
          alt=""
          fill
          sizes="(max-width: 520px) 78vw, (max-width: 800px) 48vw, 34rem"
        />

        <div className={`${styles.projectDescriptionCopy} ${styles.mobileDescriptionCopy}`}>
          <span className={styles.projectEyebrow}>{selectedDetails.eyebrow}</span>
          <strong className={styles.projectDescriptionTitle}>
            {selectedDetails.title}
          </strong>
          <p className={styles.projectSummary}>
            {selectedDetails.summary} {selectedDetails.task}
          </p>
          <div className={styles.techStack} aria-label="활용 기술 목록">
            {visibleTech.map((technology) => (
              <span className={styles.techBadge} key={technology}>
                {technology}
              </span>
            ))}
            {remainingTechCount > 0 ? (
              <span className={styles.moreTech} aria-label={`외 ${remainingTechCount}개 기술`}>
                +{remainingTechCount}
              </span>
            ) : null}
          </div>
          <a
            className={styles.liveSite}
            href={selectedDetails.liveUrl}
            target="_blank"
            rel="noreferrer"
          >
            LIVE SITE
          </a>
        </div>

        <div className={`${styles.projectDescriptionCopy} ${styles.desktopDescriptionCopy}`}>
          <span className={styles.projectEyebrow}>{projectDetails.flower.eyebrow}</span>
          <strong className={styles.projectDescriptionTitle}>
            {projectDetails.flower.title}
          </strong>
          <p className={styles.projectSummary}>
            {projectDetails.flower.summary} {projectDetails.flower.task}
          </p>
          <div className={styles.techStack} aria-label="Flower Dance 활용 기술 목록">
            {projectDetails.flower.tech.slice(0, VISIBLE_TECH_COUNT).map((technology) => (
              <span className={styles.techBadge} key={technology}>
                {technology}
              </span>
            ))}
            <span className={styles.moreTech} aria-label="외 4개 기술">
              +{projectDetails.flower.tech.length - VISIBLE_TECH_COUNT}
            </span>
          </div>
          <a
            className={styles.liveSite}
            href={projectDetails.flower.liveUrl}
            target="_blank"
            rel="noreferrer"
          >
            LIVE SITE
          </a>
        </div>
      </article>
      </ScaledCircle>

      <ScaledCircle className={styles.hamsterDescriptionCircle} designSize={560}>
        <article className={`${styles.projectDescription} ${styles.hamsterProjectDescription}`}>
          <Image
            className={styles.projectDescriptionBackground}
            src="/AnotherCircle.svg"
            alt=""
            fill
            sizes="22rem"
          />

          <div className={styles.projectDescriptionCopy}>
            <span className={styles.projectEyebrow}>{projectDetails.hamster.eyebrow}</span>
            <strong className={styles.projectDescriptionTitle}>
              {projectDetails.hamster.title}
            </strong>
            <p className={styles.projectSummary}>
              {projectDetails.hamster.summary} {projectDetails.hamster.task}
            </p>
            <div className={styles.techStack} aria-label="I love hamster 활용 기술 목록">
              {projectDetails.hamster.tech.slice(0, VISIBLE_TECH_COUNT).map((technology) => (
                <span className={styles.techBadge} key={technology}>
                  {technology}
                </span>
              ))}
              <span className={styles.moreTech} aria-label="외 3개 기술">
                +{projectDetails.hamster.tech.length - VISIBLE_TECH_COUNT}
              </span>
            </div>
            <a
              className={styles.liveSite}
              href={projectDetails.hamster.liveUrl}
              target="_blank"
              rel="noreferrer"
            >
              LIVE SITE
            </a>
          </div>
        </article>
      </ScaledCircle>

      <ScaledCircle className={styles.hamsterCircle} designSize={680}>
      <button
        type="button"
        className={styles.projectSwapTrigger}
        onPointerEnter={(event) => previewProject("hamster", event.pointerType)}
        onClick={() => selectProject("hamster")}
        aria-label="Hamster Care 프로젝트 정보 보기"
        aria-pressed={activeProject === "hamster"}
      >
        <div className={styles.projectCard02}>
          <div className={`${styles.mobilePreview} ${styles.hamsterPreview}`}>
            <Image
              src="/hamstercareImg.webp"
              alt=""
              fill
              sizes="(max-width: 375px) 24vw, 1px"
            />
          </div>
          <Image
            className={styles.projectCardBackground02}
            src="/AnotherCircle.svg"
            alt=""
            fill
            sizes="(max-width: 520px) 32vw, (max-width: 800px) 30vw, 32rem"
          />
          <div className={styles.imagePlaceholder02} aria-hidden="true" />
          <h3>
            Hamster
            <br />
            Care Game
          </h3>
        </div>
      </button>
      </ScaledCircle>
    </section>
  );
}
