"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import styles from "./TeamProjects.module.scss";

const projects = [
  {
    name: "For-log",
    liveUrl: "https://tae0419.github.io/forlog2/Home/index.html",
  },
  {
    name: "Midnight Chord",
    liveUrl: "https://tae0419.github.io/midnightChord/pages/opening/",
  },
  {
    name: "L:CODE",
    liveUrl: "https://lcode-2.vercel.app/",
  },
];

export function TeamProjects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const circles = Array.from(
      section.querySelectorAll<HTMLElement>(`.${styles.projectVisual}`),
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    let hasEntered = false;

    const revealCircles = () => {
      if (reduceMotion.matches) {
        gsap.set(circles, { clearProps: "transform" });
        return;
      }

      gsap.fromTo(
        circles,
        { scale: 0.06 },
        {
          scale: 1,
          duration: 0.8,
          stagger: 0.5,
          ease: "back.out(1.5)",
          overwrite: true,
        },
      );
    };

    const context = gsap.context(() => {
      if (!reduceMotion.matches) gsap.set(circles, { scale: 0.06 });

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || hasEntered) return;

          hasEntered = true;
          observer?.disconnect();
          revealCircles();
        },
        { threshold: 0.28 },
      );

      observer.observe(section);
      window.addEventListener("team-project-reveal", revealCircles);
    }, section);

    return () => {
      observer?.disconnect();
      window.removeEventListener("team-project-reveal", revealCircles);
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="team-projects"
      aria-labelledby="team-project-title"
    >
      <div className={styles.stage}>
        <h2 className={styles.title} id="team-project-title">
          <span>Team</span>
          <span>Project</span>
        </h2>

        {projects.map((project, index) => (
          <article
            className={`${styles.project} ${styles[`project${index + 1}`]}`}
            key={project.name}
          >
            <div className={styles.projectVisual}>
              <div className={styles.placeholder}>
                <div className={styles.sitePreview} aria-hidden="true">
                  <iframe
                    src={project.liveUrl}
                    title={`${project.name} 사이트 미리보기`}
                    loading="lazy"
                    tabIndex={-1}
                  />
                </div>
                <a
                  className={styles.previewLink}
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.name} 사이트 새 창에서 열기`}
                />
              </div>
            </div>
            <div className={styles.actions}>
              <a
                className={styles.liveButton}
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
              >
                Live Site
              </a>
              <button className={styles.githubButton} type="button">
                Github
              </button>
            </div>
          </article>
        ))}

        <span className={`${styles.dot} ${styles.dotLarge}`} aria-hidden="true" />
        <span className={`${styles.dot} ${styles.dotMedium}`} aria-hidden="true" />
        <span className={`${styles.dot} ${styles.dotSmall}`} aria-hidden="true" />
      </div>
    </section>
  );
}
