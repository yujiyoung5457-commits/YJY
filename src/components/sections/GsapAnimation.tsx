"use client";

import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./GsapAnimation.module.scss";

const MIXER_LAYERS = ["0", "1", "2", "3"] as const;
const DOUGH_PATH =
  "M.9 16.97S21.49-5.57 60.7 1.64 101.38.29 117.57.21s45.07-1.86 61.82 6.34 23.52-6.77 35.64-1.78 14.26 5.7 15.33 15.68 4.28 12.48-15.33 27.09-73.54 18.18-90.77 12.83-39.68-.71-64.63-2.5-44.91-7.11-50.61-18.35S-2.22 23.1.9 16.97Z";
const MOVE_01_PATH =
  "M193.19,1.1s-3.8,4.9-8.55,9.18-76.51,25.66-106.93,26.61S26.37,47.83,9.74,60.19s-15.23,58.93,30.17,64.16,107.18-4.16,129.99-32.97,31.37-68.26,33.27-82.04-9.98-8.23-9.98-8.23Z";
const MOVE_02_PATH =
  "M89.22,1.37s-40.28,2.85-56.67,13.19S7.59,31.67,2.6,50.2s-5.55,42.02,23.96,53.98,94.74,6.26,117.19-5.86,27.8-43.13,7.49-74.85S89.22,1.37,89.22,1.37Z";

const DUSTS = [
  {
    flavor: "strawberry",
    src: "/GsapAnimation/strawberryDust.svg",
    alt: "Strawberry dust",
    color: "#ff9caf",
  },
  {
    flavor: "choco",
    src: "/GsapAnimation/chocoDust.svg",
    alt: "Choco dust",
    color: "#c99a72",
  },
  {
    flavor: "banana",
    src: "/GsapAnimation/bananaDust.svg",
    alt: "Banana fluff",
    color: "#fff0a0",
  },
] as const;

type Flavor = (typeof DUSTS)[number]["flavor"];

const HAMSTER_IMAGES: Record<Flavor, string> = {
  strawberry: "/GsapAnimation/pinkhamster.svg",
  banana: "/GsapAnimation/yellowhamster.svg",
  choco: "/GsapAnimation/chocohamster.svg",
};

export function GsapAnimation() {
  const sectionRef = useRef<HTMLElement>(null);
  const mixerRef = useRef<HTMLDivElement>(null);
  const bowlRef = useRef<HTMLDivElement>(null);
  const doughLayerRef = useRef<HTMLDivElement>(null);
  const doughRef = useRef<SVGPathElement>(null);
  const pipingBagRef = useRef<HTMLDivElement>(null);
  const bagMouthRef = useRef<HTMLDivElement>(null);
  const filledBagRef = useRef<HTMLDivElement>(null);
  const filledBagNozzleRef = useRef<HTMLDivElement>(null);
  const move01Ref = useRef<HTMLDivElement>(null);
  const move02Ref = useRef<HTMLDivElement>(null);
  const resultHamsterRef = useRef<HTMLDivElement>(null);
  const replayButtonRef = useRef<HTMLButtonElement>(null);
  const replayActionRef = useRef<() => void>(() => undefined);
  const dustRefs = useRef<Partial<Record<Flavor, HTMLButtonElement>>>({});
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const mixer = mixerRef.current;
    const bowl = bowlRef.current;
    const doughLayer = doughLayerRef.current;
    const dough = doughRef.current;
    const pipingBag = pipingBagRef.current;
    const bagMouth = bagMouthRef.current;
    const filledBag = filledBagRef.current;
    const filledBagNozzle = filledBagNozzleRef.current;
    const move01 = move01Ref.current;
    const move02 = move02Ref.current;
    const resultHamster = resultHamsterRef.current;
    const replayButton = replayButtonRef.current;
    const dustBoxes = DUSTS.map(({ flavor }) => dustRefs.current[flavor]).filter(
      (box): box is HTMLButtonElement => Boolean(box),
    );

    if (
      !section ||
      !mixer ||
      !bowl ||
      !doughLayer ||
      !dough ||
      !pipingBag ||
      !bagMouth ||
      !filledBag ||
      !filledBagNozzle ||
      !move01 ||
      !move02 ||
      !resultHamster ||
      !replayButton ||
      dustBoxes.length !== DUSTS.length
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger, Draggable);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let hasSelected = false;
    let whiskTween: gsap.core.Tween | undefined;
    let introTimeline: gsap.core.Timeline | undefined;
    let recipeTimeline: gsap.core.Timeline | undefined;
    const draggables: Draggable[] = [];

    const context = gsap.context(() => {
      gsap.set(pipingBag, { autoAlpha: 0, x: 100 });
      gsap.set(filledBag, { autoAlpha: 0 });
      gsap.set([move01, move02, resultHamster], { autoAlpha: 0 });
      gsap.set(replayButton, { autoAlpha: 0 });

      const startWhisk = () => {
        whiskTween?.kill();
        whiskTween = gsap.to(`.${styles.layer1}`, {
          rotation: 2,
          transformOrigin: "50% 10%",
          duration: 0.11,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      };

      if (!reduceMotion.matches) {
        introTimeline = gsap.timeline({
          defaults: { duration: 0.75, ease: "back.out(1.35)" },
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        });

        introTimeline
          .from(mixer, { x: -80, autoAlpha: 0, duration: 1.1, ease: "power2.out" })
          .from(dustBoxes, { x: 90, opacity: 0, stagger: 0.12 }, "-=0.55")
          .from(`.${styles.hamsterFrame}`, { scale: 0.6, rotation: 8, opacity: 0 }, "-=0.35");

        startWhisk();
      }

      const chooseDust = (selectedBox: HTMLButtonElement) => {
        if (hasSelected) return;
        hasSelected = true;

        const flavor = selectedBox.dataset.flavor as Flavor;
        const dust = DUSTS.find((item) => item.flavor === flavor);
        if (!dust) return;

        setSelectedFlavor(flavor);
        draggables.forEach((draggable) => draggable.disable());
        whiskTween?.kill();

        const finalLeft = section.clientWidth * 0.785;
        const finalTop = section.clientHeight * 0.47;
        const otherBoxes = dustBoxes.filter((box) => box !== selectedBox);
        recipeTimeline = gsap.timeline({ defaults: { ease: "power2.inOut" } });

        recipeTimeline
          .to(selectedBox, { rotation: -32, duration: 0.35 })
          .addLabel("flavored")
          .to(dough, { fill: dust.color, duration: 0.45 }, "<0.08")
          .to(
            otherBoxes,
            { x: section.clientWidth, autoAlpha: 0, duration: 0.8, stagger: 0.08 },
            "<",
          )
          .to(
            selectedBox,
            {
              x: finalLeft - selectedBox.offsetLeft,
              y: finalTop - selectedBox.offsetTop,
              rotation: 0,
              duration: 0.8,
            },
            "<0.08",
          )
          .to(
            bowl,
            {
              rotation:85,
              transformOrigin: "50% 50%",
              duration: 0.65,
            },
            "flavored+=2",
          )
          .to(
            doughLayer,
            {
              animation: "none",
              x: "95%",
              y: "193%",
              duration: 0.75,
              ease: "power2.out",
            },
            "<",
          )
          .to(
            mixer,
            { x: "-45%", duration: 0.9, ease: "power2.inOut" },
            ">+=0.3",
          )
          .to(
            pipingBag,
            { x: 0, autoAlpha: 1, duration: 0.85, ease: "power2.out" },
            "<0.12",
          )
          .to(
            selectedBox,
            { x: section.clientWidth, autoAlpha: 0, duration: 0.65 },
            "<",
          )
          .to(doughLayer, {
            x: () => {
              const doughBounds = doughLayer.getBoundingClientRect();
              const mouthBounds = bagMouth.getBoundingClientRect();
              const distance =
                mouthBounds.left + mouthBounds.width * 0.35 -
                (doughBounds.left + doughBounds.width * 0.5);
              return `+=${distance}`;
            },
            y: () => {
              const doughBounds = doughLayer.getBoundingClientRect();
              const mouthBounds = bagMouth.getBoundingClientRect();
              const distance =
                mouthBounds.top + mouthBounds.height * 0.5 -
                (doughBounds.top + doughBounds.height * 0.5);
              return `+=${distance}`;
            },
            scale: 0.78,
            duration: 0.8,
            ease: "power2.inOut",
          })
          .to(
            doughLayer,
            { autoAlpha: 0, scale: 0.18, duration: 0.45, ease: "power2.in" },
            ">+=0.15",
          )
          .to(
            pipingBag,
            { autoAlpha: 0, scale: 0.86, duration: 0.35 },
            ">+=0.15",
          )
          .fromTo(
            filledBag,
            { autoAlpha: 0, x: -110, y: 125, rotation: -65, scale: 0.72 },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              rotation: 25,
              scale: 1,
              duration: 1.05,
              ease: "power2.inOut",
            },
            "<0.05",
          )
          .set(move01, {
            x: () => {
              const sectionBounds = section.getBoundingClientRect();
              const nozzleBounds = filledBagNozzle.getBoundingClientRect();
              return nozzleBounds.left - sectionBounds.left - move01.offsetWidth * 0.94;
            },
            y: () => {
              const sectionBounds = section.getBoundingClientRect();
              const nozzleBounds = filledBagNozzle.getBoundingClientRect();
              return nozzleBounds.top - sectionBounds.top + nozzleBounds.height * 0.35;
            },
            transformOrigin: "94% 6%",
          })
          .fromTo(
            move01,
            { autoAlpha: 0, scale: 0.08 },
            { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.25)" },
            ">-=0.05",
          )
          .to(move01, { autoAlpha: 0, scale: 0.86, duration: 0.3 }, ">+=0.3")
          .set(move02, {
            x: () => {
              const sectionBounds = section.getBoundingClientRect();
              const nozzleBounds = filledBagNozzle.getBoundingClientRect();
              return nozzleBounds.left - sectionBounds.left - move02.offsetWidth * 0.78;
            },
            y: () => {
              const sectionBounds = section.getBoundingClientRect();
              const nozzleBounds = filledBagNozzle.getBoundingClientRect();
              return nozzleBounds.bottom - sectionBounds.top + move02.offsetHeight * 0.18;
            },
          })
          .fromTo(
            move02,
            { autoAlpha: 0, scale: 0.7 },
            { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.3)" },
            "<",
          )
          .to(move02, { autoAlpha: 0, scale: 0.82, duration: 0.35 }, ">+=0.45")
          .set(resultHamster, {
            x: () => {
              const sectionBounds = section.getBoundingClientRect();
              const nozzleBounds = filledBagNozzle.getBoundingClientRect();
              return nozzleBounds.left - sectionBounds.left - resultHamster.offsetWidth * 0.72;
            },
            y: () => {
              const sectionBounds = section.getBoundingClientRect();
              const nozzleBounds = filledBagNozzle.getBoundingClientRect();
              return (
                nozzleBounds.bottom -
                sectionBounds.top -
                resultHamster.offsetHeight * 0.12
              );
            },
          })
          .fromTo(
            resultHamster,
            { autoAlpha: 0, scale: 0.42, yPercent: 12 },
            {
              autoAlpha: 1,
              scale: 1,
              yPercent: 0,
              duration: 0.8,
              ease: "back.out(1.45)",
            },
            "<0.05",
          )
          .fromTo(
            replayButton,
            { autoAlpha: 0, scale: 0.72, y: -12 },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 0.55,
              ease: "back.out(1.5)",
            },
            ">+=0.2",
          );
      };

      dustBoxes.forEach((box) => {
        const [draggable] = Draggable.create(box, {
          type: "x,y",
          bounds: section,
          edgeResistance: 0.78,
          onPress() {
            gsap.set(box, { zIndex: 10, scale: 1.04 });
          },
          onDragEnd() {
            gsap.set(box, { zIndex: "", scale: 1 });

            if (Draggable.hitTest(box, bowl, "18%")) {
              chooseDust(box);
              return;
            }

            gsap.to(box, {
              x: 0,
              y: 0,
              rotation: 0,
              duration: 0.55,
              ease: "back.out(1.4)",
            });
          },
        });

        draggables.push(draggable);
      });

      replayActionRef.current = () => {
        recipeTimeline?.kill();
        whiskTween?.kill();
        hasSelected = false;
        setSelectedFlavor(null);

        gsap.set(mixer, { clearProps: "transform,opacity,visibility" });
        gsap.set(bowl, { clearProps: "transform" });
        gsap.set(doughLayer, {
          clearProps: "transform,opacity,visibility,animation",
        });
        gsap.set(dough, { fill: "#fff9d4", clearProps: "opacity,visibility" });
        gsap.set(dustBoxes, { clearProps: "transform,opacity,visibility,z-index" });
        gsap.set(pipingBag, { clearProps: "transform" });
        gsap.set(pipingBag, { autoAlpha: 0, x: 100 });
        gsap.set(filledBag, { clearProps: "transform" });
        gsap.set([filledBag, move01, move02, resultHamster, replayButton], {
          autoAlpha: 0,
        });

        draggables.forEach((draggable) => {
          draggable.enable();
          draggable.update();
        });

        if (!reduceMotion.matches) {
          introTimeline?.restart();
          startWhisk();
        }
      };
    }, section);

    return () => {
      replayActionRef.current = () => undefined;
      draggables.forEach((draggable) => draggable.kill());
      context.revert();
    };
  }, []);

  return (
    <section
      id="gsap-animation"
      ref={sectionRef}
      className={styles.section}
      aria-label="Animated stand mixer"
    >
      <div
        ref={mixerRef}
        className={styles.mixer}
        role="img"
        aria-label="A red stand mixer making dough"
      >
        {MIXER_LAYERS.map((layer) => (
          <div
            ref={layer === "2" ? bowlRef : undefined}
            className={`${styles.layer} ${styles[`layer${layer}`]}`}
            key={layer}
            aria-hidden="true"
          >
            <Image
              src={`/GsapAnimation/${layer}.svg`}
              alt=""
              fill
              sizes="(max-width: 700px) 1px, 31vw"
            />
          </div>
        ))}

        <div
          ref={doughLayerRef}
          className={`${styles.layer} ${styles.layerDough}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 231.23 62.73" preserveAspectRatio="none">
            <path ref={doughRef} d={DOUGH_PATH} fill="#fff9d4" />
          </svg>
        </div>
      </div>

      <div ref={pipingBagRef} className={styles.pipingBag} aria-hidden="true">
        <div className={styles.pipingBagArtwork}>
          <Image
            src="/GsapAnimation/zzalzu01.svg"
            alt=""
            fill
            sizes="46vw"
          />
          <div ref={bagMouthRef} className={styles.bagMouth} />
        </div>
      </div>

      <div ref={filledBagRef} className={styles.filledBag} aria-hidden="true">
        <Image
          src="/GsapAnimation/zzalzu02.svg"
          alt=""
          fill
          sizes="26vw"
        />
        <div ref={filledBagNozzleRef} className={styles.filledBagNozzle} />
      </div>

      <div ref={move01Ref} className={`${styles.creation} ${styles.move01}`} aria-hidden="true">
        <svg viewBox="0 0 203.37 125.72">
          <path d={MOVE_01_PATH} fill={DUSTS.find((dust) => dust.flavor === selectedFlavor)?.color ?? "#ff8fa2"} />
        </svg>
      </div>

      <div ref={move02Ref} className={`${styles.creation} ${styles.move02}`} aria-hidden="true">
        <svg viewBox="0 0 163.89 110.79">
          <path d={MOVE_02_PATH} fill={DUSTS.find((dust) => dust.flavor === selectedFlavor)?.color ?? "#ff8fa2"} />
        </svg>
      </div>

      <div
        ref={resultHamsterRef}
        className={`${styles.creation} ${styles.resultHamster}`}
        aria-hidden="true"
      >
        <Image
          src={HAMSTER_IMAGES[selectedFlavor ?? "strawberry"]}
          alt=""
          fill
          sizes="18vw"
        />
      </div>

      <button
        ref={replayButtonRef}
        className={styles.replayButton}
        type="button"
        aria-label="Replay the mixer animation"
        onClick={() => replayActionRef.current()}
      >
        <Image
          src="/GsapAnimation/replay.svg"
          alt="Replay"
          width={152}
          height={113}
          sizes="14vw"
        />
      </button>

      <div className={styles.dusts} aria-label="Drag a flavor into the mixing bowl">
        {DUSTS.map(({ flavor, src, alt }) => (
          <button
            ref={(element) => {
              if (element) dustRefs.current[flavor] = element;
            }}
            className={`${styles.dust} ${styles[`dust${flavor}`]}`}
            type="button"
            data-flavor={flavor}
            aria-label={`Drag ${alt.toLowerCase()} into the bowl`}
            key={flavor}
          >
            <Image src={src} alt={alt} fill sizes="15vw" draggable={false} />
          </button>
        ))}
      </div>

      <div className={styles.hamsterFrame}>
        <Image
          src="/GsapAnimation/real_hamster.png"
          alt="A hamster beside the mixer"
          fill
          sizes="(max-width: 700px) 1px, 15vw"
        />
      </div>

      <p className={styles.visuallyHidden} aria-live="polite">
        {selectedFlavor ? `${selectedFlavor} dust was added to the dough.` : ""}
      </p>
    </section>
  );
}
