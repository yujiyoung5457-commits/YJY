"use client";

import { useEffect, useState, type MouseEvent } from "react";
import styles from "./GoProjectButton.module.scss";

const TEAM_PROJECTS_ID = "team-projects";

export function GoProjectButton() {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const initialScrollY = window.scrollY;

    const dismissOnScroll = () => {
      if (Math.abs(window.scrollY - initialScrollY) <= 2) return;

      setIsDismissed(true);
      window.removeEventListener("scroll", dismissOnScroll);
    };

    window.addEventListener("scroll", dismissOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", dismissOnScroll);
  }, []);

  const moveToTeamProjects = () => {
    const teamProjects = document.getElementById(TEAM_PROJECTS_ID);
    if (!teamProjects) return;

    setIsDismissed(true);
    window.requestAnimationFrame(() => {
      teamProjects.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closeButton = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsDismissed(true);
  };

  return (
    <div
      className={`${styles.wrapper} ${isDismissed ? styles.isDismissed : ""}`}
      aria-hidden={isDismissed}
    >
      <button
        className={styles.mainButton}
        type="button"
        tabIndex={isDismissed ? -1 : 0}
        onClick={moveToTeamProjects}
      >
        <strong>GO PROJECT !</strong>
        <span>Close to explore the full portfolio</span>
      </button>

      <button
        className={styles.closeButton}
        type="button"
        tabIndex={isDismissed ? -1 : 0}
        aria-label="GO PROJECT 버튼 닫기"
        onClick={closeButton}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
