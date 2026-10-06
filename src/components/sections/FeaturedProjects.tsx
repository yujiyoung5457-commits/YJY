"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./FeaturedProjects.module.scss";

export function FeaturedProjects() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const goButtonRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline>(null);
  const titleIntroTimelineRef = useRef<gsap.core.Timeline>(null);
  const titleTimelineRef = useRef<gsap.core.Timeline>(null);
  const isMovingRef = useRef(false);

  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
    };
  }, []);

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

  const handleGoClick = () => {
    const button = goButtonRef.current;
    const lastProject = document.getElementById("another-project");
    const teamProject = document.getElementById("team-projects");

    if (!button || !lastProject || !teamProject || isMovingRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const headerHeight = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
    ) || 0;
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const lastProjectY = gsap.utils.clamp(
      0,
      maxScroll,
      window.scrollY + lastProject.getBoundingClientRect().top - headerHeight,
    );
    const teamProjectY = gsap.utils.clamp(
      0,
      maxScroll,
      window.scrollY + teamProject.getBoundingClientRect().top - headerHeight,
    );
    const reboundY = Math.max(
      0,
      teamProjectY - Math.min(window.innerHeight * 0.065, 72),
    );

    button.classList.remove(styles.goLaunched);

    if (reduceMotion) {
      button.classList.add(styles.goLaunched);
      window.scrollTo(0, teamProjectY);
      return;
    }

    isMovingRef.current = true;
    const scrollPosition = { y: window.scrollY };

    timelineRef.current = gsap
      .timeline({
        onComplete: () => {
          isMovingRef.current = false;
          gsap.set(button, { clearProps: "transform" });
        },
      })
      .to(button, { scale: 1.6, duration: 0.38, ease: "back.out(1.8)" })
      .add(() => button.classList.add(styles.goLaunched))
      .to(button, { scale: 1, duration: 0.28, ease: "power3.inOut" })
      .to(
        scrollPosition,
        {
          y: lastProjectY,
          duration: 1.25,
          ease: "power2.in",
          onUpdate: () => window.scrollTo(0, scrollPosition.y),
        },
        ">-0.05",
      )
      .to(scrollPosition, {
        y: lastProjectY,
        duration: 0.8,
        ease: "none",
        onUpdate: () => window.scrollTo(0, scrollPosition.y),
      })
      .to(scrollPosition, {
        y: reboundY,
        duration: 2.15,
        ease: "sine.inOut",
        onUpdate: () => window.scrollTo(0, scrollPosition.y),
      })
      .to(scrollPosition, {
        y: teamProjectY,
        duration: 0.46,
        ease: "sine.inOut",
        onUpdate: () => window.scrollTo(0, scrollPosition.y),
        onComplete: () => window.dispatchEvent(new Event("team-project-reveal")),
      });
  };

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
        <button
          ref={goButtonRef}
          className={styles.go}
          type="button"
          aria-controls="another-project team-projects"
          onClick={handleGoClick}
        >
          <Image
            className={styles.goShape}
            src="/go_go.svg"
            alt=""
            fill
            sizes="20rem"
          />
          <span>Go</span>
        </button>
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
