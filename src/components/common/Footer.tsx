import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.txtBox}>
          <span>© {new Date().getFullYear()}Yu Jiyeong. All Rights Reserved.</span>
          {/* <br /> */}
          <span>THANKS FOR VISITING.</span>
        </div>


        <p>ORIGINAL WORKS MAY NOT BE REPRODUCED WITHOUT PERMISSION.</p>
      </div>
    </footer>
  );
}
