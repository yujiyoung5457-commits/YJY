import React from 'react'
import styles from './GatchaPOP.module.scss'
import Image from 'next/image'

const GatchaPOP = () => {

    const LIVE_SITE_URL = "https://yujiyoung5457-commits.github.io/GatchaPOP/";

  return (
    <main className={styles.section}>
        <h3>Creative Web Experience</h3>
        <div className={styles.popMain}>
             <iframe
      src={LIVE_SITE_URL}
      title="React AI Study 라이브 사이트 미리보기"
      loading="lazy"
      tabIndex={-1}
    />
        </div>
    </main>
  )
}

export default GatchaPOP