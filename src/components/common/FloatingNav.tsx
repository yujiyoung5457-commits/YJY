import Image from "next/image";
import styles from "./FloatingNav.module.scss";

const buttons = [
  {
    label: "Top",
    href: "#home",
    image: "/pt_img/buttonTOP.svg",
    className: styles.top,
  },
  {
    label: "About",
    href: "#about",
    image: "/pt_img/buttonAI.svg",
    className: styles.about,
  },
];

export function FloatingNav() {
  return (
    <nav className={styles.nav} aria-label="페이지 바로가기">
      {buttons.map((button) => (
        <a
          className={`${styles.button} ${button.className}`}
          href={button.href}
          key={button.href}
        >
          <Image
            className={styles.image}
            src={button.image}
            alt=""
            fill
            sizes="(max-width: 600px) 64px, 104px"
          />
          <span>{button.label}</span>
        </a>
      ))}
    </nav>
  );
}
