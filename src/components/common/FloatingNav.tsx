"use client";

import Image from "next/image";
import styles from "./FloatingNav.module.scss";

export function FloatingNav() {
  return (
    <nav className={styles.nav} aria-label="페이지 바로가기">
      <a className={`${styles.button} ${styles.top}`} href="#home">
        <Image
          className={styles.image}
          src="/pt_img/buttonTOP.svg"
          alt=""
          fill
          sizes="(max-width: 600px) 64px, 104px"
        />
        <span>Top</span>
      </a>

      <button
        type="button"
        className={`${styles.button} ${styles.about}`}
        onClick={() => window.dispatchEvent(new Event("open-portfolio-chatbot"))}
        aria-label="포트폴리오 가이드 챗봇 열기"
      >
        <Image
          className={styles.image}
          src="/pt_img/buttonAI.svg"
          alt=""
          fill
          sizes="(max-width: 600px) 64px, 104px"
        />
        <span>Chat<br />Bot</span>
      </button>
    </nav>
  );
}
