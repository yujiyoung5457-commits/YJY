import styles from "./GatchaPOP.module.scss";

const technologies = [
  "HTML",
  "CSS3",
  "JavaScript",
  "Three.js",
  "SCSS/CSS Modules",
] as const;

const LIVE_SITE_URL = "https://yujiyoung5457-commits.github.io/GatchaPOP/";

const GatchaPOP = () => {
  return (
    <section className={styles.section} aria-labelledby="gatcha-pop-title">
      <div className={styles.popMain}>
        <iframe
          src={LIVE_SITE_URL}
          title="Gatcha POP 라이브 사이트 미리보기"
          loading="lazy"
        />
      </div>

      <div className={styles.projectCopy}>
        <h2 id="gatcha-pop-title">
          Creative Web
          <br />
          Experience
        </h2>
        <p>
          오리지널 캐릭터와 그래픽을 활용한 팝 아트 스타일의 직관형 웹사이트로
          시각적 표현과 레이아웃에 집중해 메인 화면을 제작했습니다.
        </p>

        <ul className={styles.technologyList} aria-label="사용 기술">
          {technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default GatchaPOP;
