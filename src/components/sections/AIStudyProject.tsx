import Image from "next/image";
import styles from "./AIStudyProject.module.scss";

const technologies = [
  "Next.js",
  "TypeScript",
  "React",
  "SCSS Modules",
  "GCP",
  "OpenAI API",
  "Node.js",
  "Express",
  "MySQL",
  "WebSocket",
] as const;

const LIVE_SITE_URL = "https://ai-study-mu.vercel.app/";

export function AIStudyProject() {
  return (
    <section
      className={styles.section}
      id="ai-study"
      aria-labelledby="ai-study-title"
    >
      <div className={styles.layout}>
        <div className={styles.summarySlot}>
        <article className={styles.projectSummary}>
          <Image
            className={styles.circleArtwork}
            src="/AnotherCircle.svg"
            alt=""
            fill
            sizes="34vw"
          />

          <div className={styles.summaryCopy}>
            <p className={styles.eyebrow}>Frontend&amp;Backend</p>
            <h2 className={styles.title} id="ai-study-title">
              Next.js-based React
              <br />
              Learning Platform
            </h2>
            <span className={styles.divider} aria-hidden="true" />
            <p className={styles.description}>
              OpenAI API 기반 React 학습 기능과 RAG 챗봇을 구현했습니다.
              소셜 로그인, Google Cloud SQL(MySQL) 기반 회원관리,
              WebSocket 실시간 채팅을 개발하고
              Node.js·Express 서버를 Google Cloud Run에 배포했습니다.
            </p>
          </div>
        </article>
        </div>
          
        <div className={styles.projectMedia}>
  {/* 사이트 박스 뒤에 들어가는 빨간 장식
  <Image
    className={styles.redSQ}
    src="/redSQ.svg"
    alt=""
    fill
    sizes="35vw"
    aria-hidden="true"
  /> */}

  <div className={styles.livePreview}>
    <div className={styles.printMask}>
      <Image
        className={styles.previewImage}
        src="/reactRunning.png"
        alt="React AI Study 프로젝트 화면"
        fill
        sizes="(max-width: 900px) 92vw, 52vw"
      />
      <a
        className={styles.previewLink}
        href={LIVE_SITE_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="React AI Study 라이브 사이트 새 탭에서 열기"
      />
    </div>
  </div>

  <ul className={styles.technologyList} aria-label="사용 기술">
    {technologies.map((technology) => (
      <li key={technology}>{technology}</li>
    ))}
  </ul>
</div>
      </div>
    </section>
  );
}
