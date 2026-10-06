"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Header.module.scss";

const links = [
  { label: "Main", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
  { label: "About Me", href: "#about" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePinnedState = () => {
      const sentinel = sentinelRef.current;
      if (sentinel) setIsPinned(sentinel.getBoundingClientRect().top <= 0);
    };

    updatePinnedState();
    window.addEventListener("scroll", updatePinnedState, { passive: true });
    window.addEventListener("resize", updatePinnedState);

    return () => {
      window.removeEventListener("scroll", updatePinnedState);
      window.removeEventListener("resize", updatePinnedState);
    };
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 375px)");
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setMenuOpen(false);
    };

    mobileQuery.addEventListener("change", handleBreakpointChange);
    return () => mobileQuery.removeEventListener("change", handleBreakpointChange);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <header className={`${styles.header} ${isPinned ? styles.headerPinned : ""}`}>
        <div className={styles.inner}>
          <a className={styles.brand} href="#home" onClick={() => setMenuOpen(false)}>
            Yu Ji Yeong
          </a>
          <button
            className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
            type="button"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            id="mobile-navigation"
            className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}
            aria-label="주요 메뉴"
          >
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
