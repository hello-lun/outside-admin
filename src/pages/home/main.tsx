import React, { useEffect, useState, useRef } from 'react';
import styles from './main.module.scss';
import Goods from './goods/goods';
import SpeakWord, { AudioComponentMethods } from '@/components/speakWord';

const Main: React.FC = () => {
  return (
    <div className={styles.main}>
      <div className={styles.banner}>
        <div className={styles['banner-text']}>
          <p className={styles['banner-title']}>
            <span className={styles['title-topic']}>SNEPOW</span>, Leading a Smart Energy Future
          </p>
          <p className={styles['banner-subtitle']}>Focus on the development and service of battery technology-based energy storage systems.</p>
          <div className={styles['banner-button']}>LEARN MORE</div>
        </div>
      </div>
      <div className='content'>
        <Goods />
      </div>
    </div>
  );
};

export default Main;
