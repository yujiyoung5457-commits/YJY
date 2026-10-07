"use client";

import Image from "next/image";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import styles from "./Skills.module.scss";

/* 자동으로 다음 슬라이드로 넘어가는 시간입니다. 4000 = 4초입니다. */
const SLIDE_INTERVAL_MS = 4000;

/*
 * 각 물감 줄기의 개별 조절값입니다.
 * color: 물감 색상
 * length: 물감 길이(px). 화면보다 길면 자동으로 화면 안에 맞춰집니다.
 * thickness: 물감 굵기(px)
 * wave: 위아래로 휘는 정도(px). 0이면 거의 직선입니다.
 */
const skillSlides = [
  [
    {
      name: "React",
      image: "/pt_img/reactcolor.webp",
      paint: { color: "#6cf5ff", length: 680, thickness: 38, wave: 24 },
    },
    {
      name: "TypeScript",
      image: "/pt_img/ts.webp",
      paint: { color: "#33beff", length: 530, thickness: 36, wave: 20 },
    },
    {
      name: "HTML5",
      image: "/pt_img/htmll.webp",
      paint: { color: "#ff9f32", length: 800, thickness: 40, wave: 26 },
    },
    {
      name: "CSS3",
      image: "/pt_img/csscolor.webp",
      paint: { color: "#6f96ff", length: 780, thickness: 36, wave: 22 },
    },
    {
      name: "JavaScript",
      image: "/pt_img/colorjs.webp",
      paint: { color: "#ffeb3b", length: 700, thickness: 40, wave: 28 },
    },
  ],
  [
    {
      name: "Illustrator",
      image: "/pt_img/illust.webp",
      paint: { color: "#ffa600", length: 900, thickness: 38, wave: 24 },
    },
    {
      name: "InDesign",
      image: "/pt_img/indesign.webp",
      paint: { color: "#ff0055", length: 810, thickness: 36, wave: 20 },
    },
    {
      name: "Figma",
      image: "/pt_img/figma.webp",
      paint: { color: "#b340ff", length: 800, thickness: 40, wave: 26 },
    },
    {
      name: "Premiere",
      image: "/pt_img/premire.webp",
      paint: { color: "#c2b7ff", length: 790, thickness: 36, wave: 22 },
    },
    {
      name: "React Native",
      image: "/pt_img/rn.webp",
      paint: { color: "#ccc", length: 750, thickness: 40, wave: 28 },
    },
  ],
  [
    {
      name: "Photoshop",
      image: "/pt_img/photoshop.webp",
      paint: { color: "#9bb3f5", length: 860, thickness: 38, wave: 24 },
    },
    {
      name: "Codex",
      image: "/pt_img/codex.webp",
      paint: { color: "#ffffff", length: 830, thickness: 36, wave: 20 },
    },
    {
      name: "GPT",
      image: "/pt_img/gpt.webp",
      paint: { color: "#b9b9b9", length: 850, thickness: 40, wave: 26 },
    },
    {
      name: "DaVinci Resolve",
      image: "/pt_img/davinch.webp",
      paint: { color: "#64e675", length: 760, thickness: 36, wave: 22 },
    },
  ],
] as const;

const SKILL_ROW_COUNT = 5;

type Point = {
  x: number;
  y: number;
};

const getCubicPoint = (
  start: Point,
  control1: Point,
  control2: Point,
  end: Point,
  time: number,
) => {
  const inverseTime = 1 - time;

  return {
    x:
      inverseTime ** 3 * start.x +
      3 * inverseTime ** 2 * time * control1.x +
      3 * inverseTime * time ** 2 * control2.x +
      time ** 3 * end.x,
    y:
      inverseTime ** 3 * start.y +
      3 * inverseTime ** 2 * time * control1.y +
      3 * inverseTime * time ** 2 * control2.y +
      time ** 3 * end.y,
  };
};

export function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const skillListRef = useRef<HTMLDivElement>(null);
  const titleGraphicRef = useRef<HTMLDivElement>(null);
  const [isPainted, setIsPainted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const activeSkills = skillSlides[activeSlide];

  useEffect(() => {
    const titleGraphic = titleGraphicRef.current;
    if (!titleGraphic) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsPainted(true);
      observer.disconnect();
    }, { threshold: 0.35 });

    observer.observe(titleGraphic);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % skillSlides.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const skillList = skillListRef.current;

    if (!section || !skillList) return;

    const rows = Array.from(
      skillList.querySelectorAll<HTMLElement>(`.${styles.skillRow}`),
    );

    const paintProgress = { value: 0 };
    let paintTween: gsap.core.Tween | null = null;

    const drawPaint = (progress = paintProgress.value) => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

      rows.forEach((row, index) => {
        const rowBounds = row.getBoundingClientRect();
        const canvas = row.querySelector<HTMLCanvasElement>(`.${styles.paintCanvas}`);
        const skill = activeSkills[index];

        if (!canvas) return;

        const width = rowBounds.width;
        const height = rowBounds.height;
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);

        const context = canvas.getContext("2d");
        if (!context) return;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, width, height);
        context.lineCap = "round";
        context.lineJoin = "round";

        const tube = row.querySelector<HTMLElement>(`.${styles.skillTube}`);
        if (!skill || !tube) return;

        const tubeBounds = tube.getBoundingClientRect();
        const paint = skill.paint;
        const responsiveScale = Math.min(1, tubeBounds.width / 400);
        const startX = tubeBounds.right - rowBounds.left - 10 * responsiveScale;
        const startY = tubeBounds.top - rowBounds.top + tubeBounds.height / 2+16;
        const availableLength = Math.max(0, width - startX - 12);
        const length = Math.min(paint.length *1.09 * responsiveScale, availableLength);
        const endX = startX + length;
        const wave = paint.wave * responsiveScale;

        const points: Point[] = [
          { x: startX - paint.thickness * 0.25, y: startY },
          { x: startX + length * 0.2, y: startY - wave },
          { x: startX + length * 0.42, y: startY + wave },
          { x: startX + length * 0.62, y: startY + wave * 0.25 },
          { x: startX + length * 0.78, y: startY - wave * 0.55 },
          { x: startX + length * 0.9, y: startY - wave * 0.75 },
          { x: endX, y: startY },
        ];

        context.beginPath();
        context.moveTo(points[0].x, points[0].y);

        const totalSteps = 100;
        const visibleSteps = Math.ceil(totalSteps * progress);

        for (let step = 1; step <= visibleSteps; step += 1) {
          const curveTime = (step / totalSteps) * 2;
          const point =
            curveTime <= 1
              ? getCubicPoint(points[0], points[1], points[2], points[3], curveTime)
              : getCubicPoint(
                  points[3],
                  points[4],
                  points[5],
                  points[6],
                  curveTime - 1,
                );
          context.lineTo(point.x, point.y);
        }

        context.strokeStyle = paint.color;
        context.lineWidth = paint.thickness * responsiveScale;
        if (progress > 0) context.stroke();
      });
    };

    const playPaint = () => {
      paintTween?.kill();
      paintProgress.value = 0;
      drawPaint(0);

      paintTween = gsap.to(paintProgress, {
        value: 1,
        duration: 1.35,
        ease: "power2.out",
        onUpdate: () => drawPaint(),
      });
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        if (motionQuery.matches) {
          paintProgress.value = 1;
          drawPaint(1);
        } else {
          playPaint();
        }
        visibilityObserver.disconnect();
      },
      { threshold: 0.15 },
    );

    const resizeObserver = new ResizeObserver(() => drawPaint());
    resizeObserver.observe(skillList);
    rows.forEach((row) => resizeObserver.observe(row));
    drawPaint(0);
    visibilityObserver.observe(section);

    return () => {
      paintTween?.kill();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [activeSkills]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="skills"
      aria-labelledby="skills-title"
    >
      <div
        ref={titleGraphicRef}
        className={`${styles.titleGraphic} ${isPainted ? styles.isPainted : ""}`}
      >
        <Image
          className={styles.titleBackground}
          src="/pt_img/skills.svg"
          alt=""
          fill
          sizes="(max-width: 700px) 92vw, 55vw"
        />
        <h2 id="skills-title">Skills</h2>
      </div>

      <Image
        className={styles.decoration}
        src="/pt_img/el06.svg"
        alt=""
        width={227}
        height={120}
      />

      <div
        ref={skillListRef}
        className={styles.skillList}
        aria-live="polite"
        aria-label={`Skill slide ${activeSlide + 1} of ${skillSlides.length}`}
      >
        {Array.from({ length: SKILL_ROW_COUNT }, (_, index) => {
          const skill = activeSkills[index];

          return (
            <div className={styles.skillRow} key={index}>
              <canvas className={styles.paintCanvas} aria-hidden="true" />
              {skill ? (
                <div className={styles.skillTube}>
                  <Image
                    key={`${activeSlide}-${skill.name}`}
                    className={styles.skillImage}
                    src={skill.image}
                    alt={skill.name}
                    fill
                    sizes="(max-width: 520px) 48vw, 25vw"
                  />
                </div>
              ) : null}
            </div>
          );
        })}

        <div className={styles.skillScale} aria-hidden="true">
          <span>100</span>
        </div>
      </div>

      <Image
        className={styles.palette}
        src="/palet.webp"
        alt=""
        width={1555}
        height={1012}
      />
    </section>
  );
}
