import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import styles from "./Button.module.scss";

export function Button({
  children,
  ...props
}: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>) {
  return (
    <a className={styles.button} {...props}>
      {children}
    </a>
  );
}
