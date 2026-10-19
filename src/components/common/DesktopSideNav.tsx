"use client";

import { useEffect, useState } from "react";
import styles from "./DesktopSideNav.module.scss";

const NAV_ITEMS = [
  { label: "ABOUT ME", targetId: "about" },
  { label: "MY JOURNEY", targetId: "my-journey" },
  { label: "TEAM PROJECT", targetId: "team-projects" },
  { label: "SKILLS", targetId: "skills" },
  { label: "LEARNING PLATFORM", targetId: "ai-study" },
  { label: "ANOTHER PROJECTS", targetId: "another-project" },
  { label: "DASHBOARD & CRUD + SHOPPING", targetId: "art-gallery" },
  { label: "MINI PROJECTS", targetId: "mini-projects" },
  { label: "ARTWORK", targetId: "artwork" },
  { label: "WEATHER API", targetId: "contact" },
  { label: "GSAP ANIMATION", targetId: "gsap-animation" },
] as const;

export function DesktopSideNav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 600px)");
    const desktopQuery = window.matchMedia("(min-width: 1025px)");
    let currentMode = mobileQuery.matches
      ? "mobile"
      : desktopQuery.matches
        ? "desktop"
        : "hidden";

    const closeWhenModeChanges = () => {
      const nextMode = mobileQuery.matches
        ? "mobile"
        : desktopQuery.matches
          ? "desktop"
          : "hidden";

      if (nextMode !== currentMode) setIsOpen(false);
      currentMode = nextMode;
    };

    mobileQuery.addEventListener("change", closeWhenModeChanges);
    desktopQuery.addEventListener("change", closeWhenModeChanges);

    return () => {
      mobileQuery.removeEventListener("change", closeWhenModeChanges);
      desktopQuery.removeEventListener("change", closeWhenModeChanges);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !window.matchMedia("(max-width: 600px)").matches) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const moveToSection = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    setIsOpen(false);

    if (window.matchMedia("(max-width: 600px)").matches) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.menuButton} ${isOpen ? styles.menuButtonOpen : ""}`}
        aria-label={isOpen ? "사이드 메뉴 닫기" : "사이드 메뉴 열기"}
        aria-expanded={isOpen}
        aria-controls="desktop-side-navigation"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      <button
        type="button"
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
        aria-label="사이드 메뉴 닫기"
        tabIndex={-1}
        onClick={() => setIsOpen(false)}
      />

      <aside
        id="desktop-side-navigation"
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <nav className={styles.nav} aria-label="포트폴리오 섹션 메뉴">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.targetId}
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => moveToSection(item.targetId)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
