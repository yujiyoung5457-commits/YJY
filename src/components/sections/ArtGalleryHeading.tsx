import styles from "./ArtGalleryHeading.module.scss";

export function ArtGalleryHeading() {
  return (
    <div className={styles.boundary}>
      <h2 className={styles.heading} id="art-gallery-title">
        <span>Code *</span> Fine Arts
      </h2>
    </div>
  );
}
