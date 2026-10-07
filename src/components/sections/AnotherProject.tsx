"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./AnotherProject.module.scss";

export function AnotherProject() {
  const firstProjectRef = useRef<HTMLAnchorElement>(null);
  const secondProjectRef = useRef<HTMLElement>(null);
  const swapTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const createSwapTimeline = () => {
    const firstProject = firstProjectRef.current;
    const secondProject = secondProjectRef.current;
    if (!firstProject || !secondProject) return null;

    swapTimelineRef.current?.kill();
    gsap.set([firstProject, secondProject], { clearProps: "transform" });

    const firstBounds = firstProject.getBoundingClientRect();
    const secondBounds = secondProject.getBoundingClientRect();
    const firstCenter = {
      x: firstBounds.left + firstBounds.width / 2,
      y: firstBounds.top + firstBounds.height / 2,
    };
    const secondCenter = {
      x: secondBounds.left + secondBounds.width / 2,
      y: secondBounds.top + secondBounds.height / 2,
    };

    const timeline = gsap.timeline({ paused: true });
    timeline
      .to(
        firstProject,
        {
          x: secondCenter.x - firstCenter.x,
          y: secondCenter.y - firstCenter.y,
          scale: secondBounds.width / firstBounds.width,
          rotation: 360,
          duration: 1.05,
          ease: "power3.inOut",
        },
        0,
      )
      .to(
        secondProject,
        {
          x: firstCenter.x - secondCenter.x,
          y: firstCenter.y - secondCenter.y,
          scale: firstBounds.width / secondBounds.width,
          rotation: -360,
          duration: 1.05,
          ease: "power3.inOut",
        },
        0,
      );

    swapTimelineRef.current = timeline;
    return timeline;
  };

  const swapProjects = () => {
    const canHover = window.matchMedia(
      "(min-width: 801px) and (hover: hover) and (pointer: fine)",
    ).matches;
    if (!canHover) return;

    (swapTimelineRef.current ?? createSwapTimeline())?.play();
  };

  const restoreProjects = () => {
    swapTimelineRef.current?.reverse();
  };

  useEffect(() => {
    const resetTimeline = () => {
      const firstProject = firstProjectRef.current;
      const secondProject = secondProjectRef.current;
      swapTimelineRef.current?.kill();
      swapTimelineRef.current = null;

      if (firstProject && secondProject) {
        gsap.set([firstProject, secondProject], { clearProps: "transform" });
      }
    };

    window.addEventListener("resize", resetTimeline);
    return () => {
      window.removeEventListener("resize", resetTimeline);
      resetTimeline();
    };
  }, []);

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

      <a
        ref={firstProjectRef}
        className={styles.projectCard}
        href="https://flower-dance-sigma.vercel.app/"
        target="_blank"
        rel="noreferrer"
        aria-label="Shopping Mall 라이브 사이트 새 창에서 열기"
      >
        <div className={`${styles.mobilePreview} ${styles.shoppingPreview}`}>
          <Image
            src="/reactShoppingmall-cotti.png"
            alt=""
            fill
            sizes="(max-width: 375px) 70vw, 1px"
          />
        </div>
        <div className={styles.imagePlaceholder} aria-label="프로젝트 이미지 영역" />
        <h3>
          Shopping
          <br />
          Mall
        </h3>
      </a>

      <article className={styles.projectDescription}>
        <Image
          className={styles.projectDescriptionBackground}
          src="/section01_background06.webp"
          alt=""
          fill
          sizes="(max-width: 520px) 78vw, (max-width: 800px) 48vw, 34rem"
        />

        <div className={styles.projectDescriptionCopy}>
          <h3>[주요 업무]</h3>
          <p>
            자체 제작 캐릭터를 활용한 반응형 쇼핑몰을 기획·구현했습니다.
            React와 Firebase를 연동해 회원·상품·찜·장바구니·주문·관리자
            기능을 제작하고, 상품 검색·필터·재고 관리와 포토존·Kakao Maps
            등 인터랙티브 기능을 구현했습니다.
          </p>
          <h3>[활용 기술]</h3>
          <p className={styles.techStack}>
            React · React Router · Zustand · SCSS Modules · Firebase Auth ·
            Firestore · Canvas · IndexedDB · Kakao Maps API
          </p>
        </div>
      </article>

      <a
        className={styles.projectSwapTrigger}
        href="https://hamster-olive-mu.vercel.app/"
        target="_blank"
        rel="noreferrer"
        aria-label="Hamster Care 라이브 사이트 새 창에서 열기"
        onPointerEnter={swapProjects}
        onPointerLeave={restoreProjects}
      >
        <article ref={secondProjectRef} className={styles.projectCard02}>
        <div className={`${styles.mobilePreview} ${styles.hamsterPreview}`}>
          <Image
            src="/hamstercareImg.png"
            alt=""
            fill
            sizes="(max-width: 375px) 24vw, 1px"
          />
        </div>
        <Image
          className={styles.projectCardBackground02}
          src="/section01_background06.webp"
          alt=""
          fill
          sizes="(max-width: 520px) 32vw, (max-width: 800px) 30vw, 32rem"
        />
        <div className={styles.imagePlaceholder02} aria-label="프로젝트 이미지 영역" />
        <h3>
          Hamster
          <br />
          Care Game
        </h3>
        </article>
      </a>

      {/* <div className={styles.nextProject} aria-hidden="true">
        <div className={styles.nextPlaceholder} />
      </div> */}
    </section>
  );
}
