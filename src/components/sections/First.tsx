import styles from "./First.module.scss";

export function First() {
  return (
    <section className={styles.section} aria-labelledby="first-title">
      <div className={styles.content}>
        <div className={styles.introduction}>
          <h2 id="first-title">DESIGNED &amp; DEVELOPED BY ME</h2>
          <p>
            일러스트와 캐릭터부터 3D 모델링, 인터랙티브 웹까지 직접 제작하고
            구현했습니다.
          </p>
        </div>

        <div className={styles.stack}>
          <h3>TECH STACK</h3>
          <p>
            Next.js · React · TypeScript · JavaScript · Three.js · GSAP · Canvas
            API · SCSS · Rhino
          </p>
        </div>

        <p className={styles.statement}>
          No stock. No shortcuts. Just my own creations.
        </p>
      </div>

      <div className={styles.pattern} aria-hidden="true" />
    </section>
  );
}
