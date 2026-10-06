"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./AboutMe.module.scss";

const details = {
  education: {
    label: "Education",
    title: "Education",
    description: "B.F.A. in Western Painting",
  },
  skills: {
    label: "Skills",
    title: "Skills",
    description: "React · TypeScript · UI/UX",
  },
  focus: {
    label: "Focus",
    title: "Focus",
    description: "Front-End · Interaction Design",
  },
} as const;

type DetailKey = keyof typeof details;

export function AboutMe() {
  const [activeDetail, setActiveDetail] = useState<DetailKey>("education");
  const selectedDetail = details[activeDetail];

  return (
    <section className={styles.section} id="about" aria-labelledby="about-title">
      <Image
        className={styles.background}
        src="/section01_background03.webp"
        alt=""
        fill
        sizes="100vw"
      />

      <Image
        className={styles.redShape}
        src="/pt_img/backRED.svg"
        alt=""
        width={433}
        height={1467}
      />

      <div className={styles.portrait} aria-hidden="true">
        <Image
          className={styles.leftLeg}
          src="/pt_img/left_leg.svg"
          alt=""
          width={430}
          height={1392}
        />
        <Image
          className={styles.rightLeg}
          src="/pt_img/right_leg.svg"
          alt=""
          width={364}
          height={902}
        />
        <Image
          className={styles.face}
          src="/pt_img/face.svg"
          alt="유지영 프로필 사진"
          width={767}
          height={1125}
        />
      </div>

      <div className={styles.content}>
        <h2 className={styles.heading} id="about-title">
          About Me
        </h2>

        <div className={styles.intro}>
          <p className={styles.name}>Yu JiYeong</p>
          <p className={styles.role}>Front-End Developer &amp; Designer</p>
        </div>

        <p className={styles.statement}>
          I turn visual ideas into
          <br />
          interactive web experiences.
        </p>

        <div className={styles.details}>
          <div className={styles.tabs} role="tablist" aria-label="소개 정보">
            {(Object.keys(details) as DetailKey[]).map((key) => (
              <button
                className={`${styles.tab} ${
                  activeDetail === key ? styles.activeTab : ""
                }`}
                id={`about-tab-${key}`}
                type="button"
                role="tab"
                aria-controls="about-detail"
                aria-selected={activeDetail === key}
                onClick={() => setActiveDetail(key)}
                key={key}
              >
                {details[key].label}
              </button>
            ))}
          </div>

          <div
            className={styles.detailCopy}
            id="about-detail"
            role="tabpanel"
            aria-labelledby={`about-tab-${activeDetail}`}
          >
            <strong>{selectedDetail.title}</strong>
            <span>{selectedDetail.description}</span>
          </div>
        </div>
      </div>

    </section>
  );
}
