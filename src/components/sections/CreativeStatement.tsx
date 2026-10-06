"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./CreativeStatement.module.scss";

export function CreativeStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const powerCanvasRef = useRef<HTMLCanvasElement>(null);
  const leftArtworkRef = useRef<HTMLImageElement>(null);
  const rightArtworkRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = powerCanvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    // 봉우리가 물결치는 주기와 전체 파도가 옆으로 천천히 흐르는 주기입니다.
    const waveDuration = 3000;
    const horizontalLoopDuration = 45000;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
    };

    const drawPower = (time = 0) => {
      if (width === 0 || height === 0) return;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle =
        getComputedStyle(canvas).getPropertyValue("--color-blue").trim() || "#060a7b";

      const motifWidth = Math.max(720, width * 0.52);
      const wavePhase = ((time % waveDuration) / waveDuration) * Math.PI * 2;
      const travel = ((time % horizontalLoopDuration) / horizontalLoopDuration) * motifWidth;
      const firstOrigin = -motifWidth - travel;
      let lastOrigin = firstOrigin;

      const waveY = (position: number, xPosition: number) => {
        const swell = Math.sin(wavePhase + xPosition * Math.PI * 4) * 0.035;
        const ripple = Math.sin(wavePhase * 2 - xPosition * Math.PI * 6) * 0.012;

        return height * (position + swell + ripple);
      };

      const appendWaveMotif = (originX: number) => {
        const x = (position: number) => originX + motifWidth * position;
        const y = waveY;

        context.bezierCurveTo(x(0.03), y(0.49, 0.03), x(0.055), y(0.66, 0.055), x(0.085), y(0.55, 0.085));
        context.bezierCurveTo(x(0.1), y(0.49, 0.1), x(0.085), y(0.38, 0.085), x(0.125), y(0.39, 0.125));
        context.bezierCurveTo(x(0.155), y(0.4, 0.155), x(0.14), y(0.72, 0.14), x(0.18), y(0.7, 0.18));
        context.bezierCurveTo(x(0.22), y(0.68, 0.22), x(0.2), y(0.49, 0.2), x(0.24), y(0.49, 0.24));
        context.bezierCurveTo(x(0.28), y(0.48, 0.28), x(0.26), y(0.63, 0.26), x(0.31), y(0.63, 0.31));
        context.bezierCurveTo(x(0.35), y(0.63, 0.35), x(0.34), y(0.51, 0.34), x(0.375), y(0.54, 0.375));
        context.bezierCurveTo(x(0.42), y(0.58, 0.42), x(0.37), y(0.76, 0.37), x(0.425), y(0.75, 0.425));
        context.bezierCurveTo(x(0.47), y(0.74, 0.47), x(0.41), y(0.54, 0.41), x(0.455), y(0.56, 0.455));
        context.bezierCurveTo(x(0.5), y(0.58, 0.5), x(0.5), y(0.7, 0.5), x(0.54), y(0.65, 0.54));
        context.bezierCurveTo(x(0.59), y(0.58, 0.59), x(0.57), y(0.5, 0.57), x(0.615), y(0.53, 0.615));
        context.bezierCurveTo(x(0.66), y(0.56, 0.66), x(0.63), y(0.72, 0.63), x(0.685), y(0.7, 0.685));
        context.bezierCurveTo(x(0.73), y(0.68, 0.73), x(0.69), y(0.37, 0.69), x(0.735), y(0.38, 0.735));
        context.bezierCurveTo(x(0.78), y(0.39, 0.78), x(0.75), y(0.67, 0.75), x(0.795), y(0.65, 0.795));
        context.bezierCurveTo(x(0.84), y(0.63, 0.84), x(0.82), y(0.56, 0.82), x(0.865), y(0.59, 0.865));
        context.bezierCurveTo(x(0.91), y(0.62, 0.91), x(0.87), y(0.75, 0.87), x(0.925), y(0.73, 0.925));
        context.bezierCurveTo(x(0.97), y(0.71, 0.97), x(0.94), y(0.52, 0.94), x(0.975), y(0.54, 0.975));
        context.bezierCurveTo(x(0.99), y(0.55, 0.99), x(0.985), y(0.59, 0.985), x(1), y(0.58, 1));
      };

      context.beginPath();
      context.moveTo(firstOrigin, waveY(0.58, 0));

      for (
        let originX = firstOrigin;
        originX < width + motifWidth;
        originX += motifWidth
      ) {
        appendWaveMotif(originX);
        lastOrigin = originX;
      }

      context.lineTo(lastOrigin + motifWidth, height);
      context.lineTo(firstOrigin, height);
      context.closePath();
      context.fill();
    };

    const animate = (time: number) => {
      drawPower(time);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const syncAnimation = () => {
      window.cancelAnimationFrame(animationFrame);

      if (document.hidden || reduceMotion.matches) {
        drawPower();
        return;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
      drawPower();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
    resizeCanvas();
    syncAnimation();

    document.addEventListener("visibilitychange", syncAnimation);
    reduceMotion.addEventListener("change", syncAnimation);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
      reduceMotion.removeEventListener("change", syncAnimation);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const leftArtwork = leftArtworkRef.current;
    const rightArtwork = rightArtworkRef.current;

    if (!section || !leftArtwork || !rightArtwork) return;

    const revealArtwork = () => {
      leftArtwork.classList.add(styles.artworkEntered);
      rightArtwork.classList.add(styles.artworkEntered);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        revealArtwork();
      },
      { threshold: 0.25 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="creative-statement-title"
    >
      <Image
        className={styles.background}
        src="/section01_background03.webp"
        alt=""
        fill
        sizes="100vw"
      />

      <canvas
        ref={powerCanvasRef}
        className={styles.power}
        aria-hidden="true"
      />

      <Image
        ref={leftArtworkRef}
        className={styles.leftArtwork}
        src="/pt_img/el01.svg"
        alt=""
        width={138}
        height={138}
      />

      <Image
        ref={rightArtworkRef}
        className={styles.rightArtwork}
        src="/pt_img/el02.svg"
        alt=""
        width={142}
        height={148}
      />

      <div className={styles.mainTitle}>
        <div className={styles.titleShadow} aria-hidden="true">
          <Image
            className={styles.titleArtwork}
            src="/pt_img/maintitle01.svg"
            alt=""
            width={319}
            height={318}
          />
        </div>
        <div className={styles.titleSurface} aria-hidden="true">
          <Image
            className={styles.titleArtwork}
            src="/pt_img/maintitle02.svg"
            alt=""
            width={319}
            height={318}
          />
        </div>

        <h2 className={styles.title} id="creative-statement-title">
          <span className={styles.anton}>Make it</span>
          <span className={styles.script}>Visible</span>
          <span className={styles.anton}>Make it</span>
          <span className={styles.script}>Work.</span>
        </h2>
      </div>
    </section>
  );
}
