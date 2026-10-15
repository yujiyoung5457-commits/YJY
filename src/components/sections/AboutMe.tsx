"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./AboutMe.module.scss";

const details = {
  education: {
    label: "Education",
    title: "Education",
    description: `B.F.A. in Western Painting
GPA 4.39 / 4.5
16 Exhibitions & Art Projects
Visual Design & Digital Media
Frontend Development Training`,
  },
  skills: {
    label: "Skills",
    title: "Skills",
    description: "React · TypeScript · UI/UX · Front-End DevelopmentUI Design · Illustration · 3D · Motion",
  },
  focus: {
    label: "Focus",
    title: "Focus",
    description: "Interactive Web · Visual Storytelling · Creative UI/UX"
  },
} as const;

type DetailKey = keyof typeof details;

export function AboutMe() {
  const [activeDetail, setActiveDetail] = useState<DetailKey>("education");
  const sectionRef = useRef<HTMLElement>(null);
  const selectedDetail = details[activeDetail];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const textItems = Array.from(
      section.querySelectorAll<HTMLElement>("[data-about-text-reveal]"),
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      textItems.forEach((item) => item.classList.add(styles.textRevealVisible));
      return;
    }

    section.classList.add(styles.revealReady);
    textItems.forEach((item, index) => {
      item.style.setProperty("--about-reveal-delay", `${index * 65}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add(styles.textRevealVisible);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );

    textItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      section.classList.remove(styles.revealReady);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="about"
      aria-labelledby="about-title"
    >
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

      <div className={styles.aboutGroups}>
        <div
          className={`${styles.portrait} ${styles.groupAbout01}`}
          aria-hidden="true"
        >
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
          <div className={styles.groupAbout02}>
            <h2
              className={`${styles.heading} ${styles.textReveal}`}
              id="about-title"
              data-about-text-reveal
            >
              About Me
            </h2>

            <div className={styles.intro}>
              <p
                className={`${styles.name} ${styles.textReveal}`}
                data-about-text-reveal
              >
                Yu JiYeong
              </p>
              <p
                className={`${styles.role} ${styles.textReveal}`}
                data-about-text-reveal
              >
                Front-End Developer &amp; Designer
              </p>
            </div>

            <p className={styles.statement}>
              <span className={styles.textReveal} data-about-text-reveal>
                I turn visual ideas
              </span>
              <span className={styles.textReveal} data-about-text-reveal>
                into interactive web
                <br className={styles.mobileStatementBreak} /> experiences.
              </span>
            </p>
          </div>

          <div className={`${styles.details} ${styles.groupAbout03}`}>
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
                  <span className={styles.textReveal} data-about-text-reveal>
                    {details[key].label}
                  </span>
                </button>
              ))}
            </div>

            <div
              className={styles.detailCopy}
              id="about-detail"
              role="tabpanel"
              aria-labelledby={`about-tab-${activeDetail}`}
            >
              <strong className={styles.textReveal} data-about-text-reveal>
                {selectedDetail.title}
              </strong>
              <span
                className={`${styles.description} ${styles.textReveal}`}
                data-about-text-reveal
              >
                {selectedDetail.description}
              </span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
