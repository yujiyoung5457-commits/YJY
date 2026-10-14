import Image from "next/image";
import { Scene } from "@/components/three/Scene";
import styles from "./AboutTo.module.scss";

export function AboutTo() {
  return (
    <section className={styles.section} aria-labelledby="about-to-title">
      <div className={`${styles.modelStage} ${styles.leftModel}`}>
        <Scene
          modelPath="/honya/HN01.glb"
          contain
          autoRotate
          turnDurationSeconds={14}
          modelScale={1.16}
          draggable
          preserveMaterialSettings
          studioLighting
        />
      </div>

      <div className={styles.copy}>
        <p className={styles.badge}>Background</p>

        <h2 id="about-to-title" className={styles.title}>
          <span>Painting → Exhibition → Design</span>
          <small>=</small>
          <strong>Interactive Web</strong>
        </h2>

        <div className={styles.processMarks} aria-label="Before and after design process">
          <Image src="/assets/before.svg" alt="Before" width={101} height={122} />
          <Image src="/assets/after.svg" alt="After" width={101} height={122} />
        </div>

        <div className={styles.likes}>
          <h3>I Like To <span className={styles.redname}>Create</span></h3>
          <p>Original Characters</p>
          <p>Illustrations · Playful Visuals</p>
        </div>
      </div>

      <div className={`${styles.modelStage} ${styles.rightModel}`}>
        <Scene
          modelPath="/honya/HN02.glb"
          contain
          autoRotate={false}
          draggable
          motion="bounce"
          preserveMaterialSettings
          studioLighting
        />
      </div>

    </section>
  );
}
