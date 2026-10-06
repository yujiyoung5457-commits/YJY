"use client";

import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./ArtSlider.module.scss";

const SLIDER_IMAGES = Array.from(
  { length: 37 },
  (_, index) => `/artwork/slider_img/${index + 1}.webp`,
);

export function ArtSlider() {
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLUListElement>(null);
  const dragProxyRef = useRef<HTMLDivElement>(null);
  const previousButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const heading = headingRef.current;

    if (!heading) return;

    const title = heading.querySelector("h2");
    const braces = Array.from(heading.querySelectorAll(":scope > span"));
    const [leftBrace, rightBrace] = braces;

    if (!title || !leftBrace || !rightBrace) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timeline: gsap.core.Timeline | undefined;
    let observer: IntersectionObserver | undefined;

    const context = gsap.context(() => {
      if (reduceMotion.matches) {
        gsap.set([leftBrace, title, rightBrace], { clearProps: "all" });
        return;
      }

      const titleWidth = title.getBoundingClientRect().width;
      const columnGap = Number.parseFloat(getComputedStyle(heading).columnGap) || 0;
      const braceShift = titleWidth / 2 + columnGap / 2;

      gsap.set(leftBrace, { x: braceShift, transformOrigin: "center" });
      gsap.set(rightBrace, { x: -braceShift, transformOrigin: "center" });
      gsap.set(title, {
        clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
        WebkitClipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
      });

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          observer?.disconnect();
          timeline = gsap.timeline();
          timeline
            .to(
              [leftBrace, rightBrace],
              { x: 0, duration: 2.2, ease: "power3.inOut" },
              0,
            )
            .to(
              title,
              {
                clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)",
                WebkitClipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)",
                duration: 1.7,
                ease: "power3.inOut",
              },
              0.35,
            );
        },
        { threshold: 0.35 },
      );

      observer.observe(heading);

    }, heading);

    return () => {
      observer?.disconnect();
      timeline?.kill();
      context.revert();
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const cardsList = cardsRef.current;
    const dragProxy = dragProxyRef.current;
    const previousButton = previousButtonRef.current;
    const nextButton = nextButtonRef.current;

    if (!stage || !cardsList || !dragProxy || !previousButton || !nextButton) return;

    gsap.registerPlugin(Draggable);

    const cards = Array.from(cardsList.children) as HTMLElement[];
    // 첫 화면: 왼쪽 1번, 가운데 2번, 오른쪽 3번
    let activeIndex = 1;
    let cleanupInteractions = () => {};

    const context = gsap.context(() => {
      const renderCards = (animate: boolean) => {
        cards.forEach((card, index) => {
          const previousIndex = gsap.utils.wrap(0, cards.length, activeIndex - 1);
          const nextIndex = gsap.utils.wrap(0, cards.length, activeIndex + 1);
          const isVisible =
            index === activeIndex || index === previousIndex || index === nextIndex;
          const position =
            index === activeIndex
              ? { xPercent: 0, scale: 1, zIndex: 3 }
              : index === nextIndex
                ? { xPercent: 82, scale: 0.9, zIndex: 2 }
                : index === previousIndex
                  ? { xPercent: -82, scale: 0.9, zIndex: 2 }
                  : { xPercent: 0, scale: 0.82, zIndex: 0 };

          const properties = {
            ...position,
            x: 0,
            autoAlpha: isVisible ? 1 : 0,
            duration: animate ? 0.55 : 0,
            ease: "power3.out",
            overwrite: true,
          };

          card.setAttribute("aria-hidden", String(!isVisible));

          if (animate) {
            gsap.to(card, properties);
          } else {
            gsap.set(card, properties);
          }
        });
      };

      const showCard = (direction: number) => {
        activeIndex = gsap.utils.wrap(0, cards.length, activeIndex + direction);
        renderCards(true);
      };

      const showNext = () => showCard(1);
      const showPrevious = () => showCard(-1);

      renderCards(false);
      nextButton.addEventListener("click", showNext);
      previousButton.addEventListener("click", showPrevious);

      const [draggable] = Draggable.create(dragProxy, {
        type: "x",
        trigger: cardsList,
        allowNativeTouchScrolling: true,
        onDrag() {
          const dragDistance = this.x - this.startX;
          gsap.set(cards, { x: dragDistance });
        },
        onDragEnd() {
          const dragDistance = this.x - this.startX;
          gsap.set(dragProxy, { x: 0 });

          if (Math.abs(dragDistance) >= 60) {
            showCard(dragDistance < 0 ? 1 : -1);
          } else {
            renderCards(true);
          }
        },
      });

      cleanupInteractions = () => {
        nextButton.removeEventListener("click", showNext);
        previousButton.removeEventListener("click", showPrevious);
        draggable.kill();
      };
    }, stage);

    return () => {
      cleanupInteractions();
      context.revert();
    };
  }, []);

  return (
    <section className={styles.section} aria-labelledby="art-slider-title">
      <div ref={stageRef} className={styles.stickyStage}>
        <div ref={headingRef} className={styles.heading}>
          <span aria-hidden="true">&#123;</span>
          <h2 id="art-slider-title">
            Art Work
            <br />
            &amp;
            <br />
            Animation
          </h2>
          <span aria-hidden="true">&#125;</span>
        </div>

        <div className={styles.gallery}>
          <ul ref={cardsRef} className={styles.cards} aria-label="작품 슬라이드">
            {SLIDER_IMAGES.map((src, index) => (
              <li key={src} className={styles.card} aria-label={`작품 ${index + 1}`}>
                <Image
                  className={styles.cardImage}
                  src={src}
                  alt={`작품 ${index + 1}`}
                  fill
                  sizes="(max-width: 700px) 74vw, 35vw"
                />
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <button ref={previousButtonRef} type="button">
              Prev
            </button>
            <button ref={nextButtonRef} type="button">
              Next
            </button>
          </div>

          <div ref={dragProxyRef} className={styles.dragProxy} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
