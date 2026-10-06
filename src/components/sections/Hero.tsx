"use client";

import { Scene } from "@/components/three/Scene";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { createHeroVortex } from "./heroVortex";
import styles from "./Hero.module.scss";

const HERO_SCROLL_DISTANCE = "+=275%";
const introBackgrounds = [
  "/heromain_1.webp",
  "/heromain_2.webp",
  "/heromain_3.webp",
  "/heromain_4.webp",
  "/heromain_5.webp",
  "/heromain_6.webp",
];

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const introPanelRef = useRef<HTMLDivElement>(null);
  const backgroundRefs = useRef<(HTMLImageElement | null)[]>([]);
  const vortexCanvasRef = useRef<HTMLCanvasElement>(null);
  const modelStageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const vortexRenderRef = useRef<(progress: number) => void>(() => undefined);
  const vortexSupportedRef = useRef(false);

  useLayoutEffect(() => {
    const canvas = vortexCanvasRef.current;
    if (!canvas) return;

    const vortex = createHeroVortex(canvas, "/heromain_6.webp");
    vortexSupportedRef.current = vortex !== null;

    if (vortex) vortexRenderRef.current = vortex.render;

    return () => {
      vortex?.dispose();
      vortexRenderRef.current = () => undefined;
      vortexSupportedRef.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const frames = backgroundRefs.current.filter(
        (frame): frame is HTMLImageElement => frame !== null,
      );
      const modelStages = modelStageRefs.current.filter(
        (stage): stage is HTMLDivElement => stage !== null,
      );
      const vortexCanvas = vortexCanvasRef.current;
      const [firstModel, secondModel] = modelStages;

      if (!frames.length || !firstModel || !secondModel) return;

      gsap.set(frames, { autoAlpha: 0 });
      gsap.set(frames[0], { autoAlpha: 1 });
      gsap.set(vortexCanvas, { autoAlpha: 0 });
      gsap.set(firstModel, { autoAlpha: 1, scale: 1 });
      gsap.set(secondModel, { autoAlpha: 0, scale: 0.72 });

      const timeline = gsap.timeline({
        defaults: { ease: "power1.inOut" },
        scrollTrigger: {
          trigger: introPanelRef.current,
          start: "top top",
          end: HERO_SCROLL_DISTANCE,
          pin: true,
          scrub: 0.38,
          anticipatePin: 1,
          onUpdate: (self) => {
            const progress = self.animation?.progress() ?? self.progress;
            const vortexProgress = gsap.utils.clamp(0, 1, (progress - 0.82) / 0.18);

            vortexRenderRef.current(vortexProgress);

            if (vortexSupportedRef.current) {
              gsap.set(vortexCanvas, { autoAlpha: vortexProgress });
            } else {
              gsap.set(frames.at(-1) ?? null, {
                scale: 1 - vortexProgress * 0.92,
                rotation: vortexProgress * 540,
                autoAlpha: 1 - vortexProgress,
              });
            }

            const zoomScale = Math.max(
              1,
              ...modelStages.map((stage) => Number(gsap.getProperty(stage, "scale"))),
            );
            window.dispatchEvent(
              new CustomEvent("hero-model-zoom", { detail: zoomScale }),
            );
          },
        },
      });

      const frameTransitionDuration = 0.12;
      const frameSequenceEnd = 0.82;

      frames.slice(1).forEach((frame, index) => {
        const frameIndex = index + 1;
        const transitionAt =
          (frameIndex / (frames.length - 1)) * frameSequenceEnd -
          frameTransitionDuration / 2;

        timeline
          .to(
            frames[frameIndex - 1],
            { autoAlpha: 0, duration: frameTransitionDuration },
            transitionAt,
          )
          .to(
            frame,
            { autoAlpha: 1, duration: frameTransitionDuration },
            transitionAt,
          );
      });

      timeline
        .to(firstModel, { scale: 8.5, duration: 0.46, ease: "power2.in" }, 0)
        .to(firstModel, { autoAlpha: 0, duration: 0.14 }, 0.32)
        .to(secondModel, { autoAlpha: 1, scale: 1, duration: 0.13 }, 0.34)
        .to(secondModel, { scale: 8.5, duration: 0.47, ease: "power2.in" }, 0.43)
        .to(secondModel, { autoAlpha: 0, duration: 0.14 }, 0.76)
        .set(firstModel, { autoAlpha: 0, scale: 0.72 }, 0.82)
        .to(firstModel, { autoAlpha: 1, scale: 1.6, duration: 0.18 }, 0.82);
    }, heroRef);

    return () => context.revert();
  }, []);

  return (
    <section ref={heroRef} className={styles.hero} id="home" aria-labelledby="hero-title">
      <div ref={introPanelRef} className={`${styles.panel} ${styles.introPanel}`}>
        <div className={styles.backgroundSequence} aria-hidden="true">
          {introBackgrounds.map((src, index) => (
            <Image
              ref={(node) => {
                backgroundRefs.current[index] = node;
              }}
              className={styles.background}
              src={src}
              alt=""
              fill
              priority={index === 0}
              loading={index === 0 ? undefined : "eager"}
              quality={100}
              sizes="100vw"
              unoptimized
              key={src}
            />
          ))}
        </div>

        <canvas
          ref={vortexCanvasRef}
          className={styles.vortexCanvas}
          aria-hidden="true"
        />

        <h1 className={`${styles.title} ${styles.developer}`} id="hero-title">
          Frontend Developer
        </h1>

        <div className={styles.modelStack}>
          <div
            ref={(node) => {
              modelStageRefs.current[0] = node;
            }}
            className={styles.modelStage}
          >
            <Scene maintainZoomQuality />
          </div>
          <div
            ref={(node) => {
              modelStageRefs.current[1] = node;
            }}
            className={styles.modelStage}
          >
            <Scene modelPath="/second3D.glb" maintainZoomQuality />
          </div>
        </div>

        <p className={`${styles.title} ${styles.designer}`}>
          <span className={styles.ampersand}>&amp;</span>
          <span>Web Designer</span>
        </p>
      </div>

      <div className={styles.subtitle}>
        <p>
          Frontend, visualized in form. Design, code, structure, and interaction in one
          object.
        </p>
      </div>

      <div className={`${styles.panel} ${styles.canvasPanel}`}>
        <Image
          className={styles.background02}
          src="/section01_background02.webp"
          alt="Colorful arched hallway"
          fill
          quality={100}
          sizes="100vw"
        />

        <p className={styles.canvasHeading}>From Canvas To</p>

        <div className={styles.artwork} aria-hidden="true">
          <Image
            className={styles.artworkGlow}
            src="/pt_img/el04_bright.svg"
            alt=""
            width={216}
            height={326}
          />
          <Image
            className={styles.artworkMain}
            src="/pt_img/el04.svg"
            alt=""
            width={123}
            height={233}
          />
        </div>

        <p className={styles.code}>Code.</p>
      </div>
    </section>
  );
}
