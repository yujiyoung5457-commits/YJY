"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./FeaturedProjects.module.scss";

export function FeaturedProjects() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleIntroTimelineRef = useRef<gsap.core.Timeline>(null);
  const titleTimelineRef = useRef<gsap.core.Timeline>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!section || !title || reduceMotion.matches) return;

    titleTimelineRef.current = gsap
      .timeline({ paused: true, repeat: -1, repeatDelay: 1.15 })
      .set(title, {
        transformPerspective: 900,
        transformOrigin: "center center",
      })
      .to(title, {
        scale: 1.14,
        z: 110,
        duration: 0.32,
        ease: "power2.out",
      })
      .to(title, {
        scale: 1.14,
        z: 110,
        duration: 0.28,
        ease: "none",
      })
      .to(title, {
        scale: 1,
        z: 0,
        duration: 0.52,
        ease: "power2.inOut",
      });

    titleIntroTimelineRef.current = gsap
      .timeline({
        paused: true,
        onComplete: () => titleTimelineRef.current?.restart(),
      })
      .fromTo(
        title,
        {
          xPercent: -145,
          skewX: -12,
          scaleX: 1.12,
          scaleY: 0.92,
          z: 0,
        },
        {
          xPercent: 5,
          skewX: 2,
          scaleX: 0.98,
          scaleY: 1.02,
          duration: 0.58,
          ease: "power4.out",
        },
      )
      .to(title, {
        xPercent: 0,
        skewX: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.14,
        ease: "power2.out",
      });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          titleTimelineRef.current?.pause(0);
          titleIntroTimelineRef.current?.restart();
          return;
        }

        titleIntroTimelineRef.current?.pause(0);
        titleTimelineRef.current?.pause(0);
        gsap.set(title, {
          xPercent: -145,
          skewX: -12,
          scaleX: 1.12,
          scaleY: 0.92,
          z: 0,
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      titleIntroTimelineRef.current?.kill();
      titleTimelineRef.current?.kill();
      gsap.set(title, { clearProps: "transform" });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="projects"
      aria-labelledby="projects-title"
    >
      <Image
        className={styles.leftArtwork}
        src="/pt_img/el03.svg"
        alt=""
        width={113}
        height={169}
      />

      <div className={styles.center}>
        <h2 ref={titleRef} className={styles.title} id="projects-title">
          <span>Selected</span>
          <span>Projects</span>
        </h2>
        <a
          className={styles.go}
          href="#another-project"
        >
          <Image
            className={styles.goShape}
            src="/go_go.svg"
            alt=""
            fill
            sizes="20rem"
          />
          <span>Go</span>
        </a>
      </div>

      <span className={styles.dot} aria-hidden="true" />

      <Image
        className={styles.rightArtwork}
        src="/pt_img/el03.svg"
        alt=""
        width={113}
        height={169}
      />
    </section>
  );
}
