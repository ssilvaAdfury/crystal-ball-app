"use client";

import Image from 'next/image';
import styles from './SimpleFortuneCard.module.css';

interface SimpleFortuneCardProps {
  fortune: string;
}

export default function SimpleFortuneCard({ fortune }: SimpleFortuneCardProps) {
  return (
    <div className={styles.cardContainer} id="simple-fortune-card">
      <div className={styles.card}>
        {/* Logo area */}
        <div className={styles.logoArea}>
          <Image 
            src="/crystalball.png" 
            alt="Crystal Ball Logo" 
            width={100} 
            height={100}
            className={styles.logo}
            priority
            unoptimized
          />
          <h3 className={styles.cardTitle}>Your Crystal Ball Fortune</h3>
        </div>
        
        {/* Fortune text */}
        <div className={styles.fortuneArea}>
          <p className={styles.fortune}>{fortune}</p>
        </div>
      </div>
    </div>
  );
} 