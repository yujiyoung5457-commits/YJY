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

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <header className={`${styles.header} ${isPinned ? styles.headerPinned : ""}`}>
        <div className={styles.inner}>
          <a className={styles.brand} href="#home">
            Yu Ji Yeong
          </a>
          <nav className={styles.nav} aria-label="주요 메뉴">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
