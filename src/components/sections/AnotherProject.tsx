"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./AnotherProject.module.scss";

const projectDetails = {
  flower: {
    title: "Flower Dance",
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

export function AnotherProject() {
  const [selectedProject, setSelectedProject] = useState<ProjectKey>("flower");
  const selectedDetails = projectDetails[selectedProject];

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

      <button
        type="button"
        className={styles.projectCard}
        onClick={() => setSelectedProject("flower")}
        aria-label="Flower Dance 쇼핑몰 프로젝트 설명 보기"
        aria-pressed={selectedProject === "flower"}
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
            src="/reactShoppingmall-cotti.png"
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

      <article className={styles.projectDescription} aria-live="polite">
        <Image
          className={styles.projectDescriptionBackground}
          src="/AnotherCircle.svg"
          alt=""
          fill
          sizes="(max-width: 520px) 78vw, (max-width: 800px) 48vw, 34rem"
        />

        <div className={styles.projectDescriptionCopy}>
          <strong className={styles.projectDescriptionTitle}>
            {selectedDetails.title}
          </strong>
          <h3>[주요 업무]</h3>
          <p>{selectedDetails.task}</p>
          <h3>[활용 기술]</h3>
          <div className={styles.techStack} aria-label="활용 기술 목록">
            {selectedDetails.tech.map((technology) => (
              <span className={styles.techBadge} key={technology}>
                {technology}
              </span>
            ))}
          </div>
        </div>
      </article>

      <button
        type="button"
        className={styles.projectSwapTrigger}
        onClick={() => setSelectedProject("hamster")}
        aria-label="Hamster Care 프로젝트 설명 보기"
        aria-pressed={selectedProject === "hamster"}
      >
        <div className={styles.projectCard02}>
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
    </section>
  );
}
