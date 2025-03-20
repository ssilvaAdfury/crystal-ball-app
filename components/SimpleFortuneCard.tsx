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
            src="/adfuryLogo.png" 
            alt="AdFury Logo" 
            width={100} 
            height={100}
            className={styles.logo}
            priority
            unoptimized
          />
        </div>
        
        {/* Fortune text */}
        <div className={styles.fortuneArea}>
          <p className={styles.fortune}>{fortune}</p>
        </div>
      </div>
    </div>
  );
} 