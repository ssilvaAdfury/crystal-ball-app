"use client";

import { forwardRef } from 'react';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import styles from './FortuneCard.module.css';

interface FortuneCardProps {
  fortune: string;
  shareUrl?: string;
  userAnswers?: {
    color?: string;
    mood?: string;
    dream?: string;
  };
}

const FortuneCard = forwardRef<HTMLDivElement, FortuneCardProps>(
  ({ fortune, shareUrl, userAnswers }, ref) => {
    return (
      <div className={styles.cardContainer} ref={ref} id="fortune-card-container">
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
            <h3 className={styles.cardTitle}>Your Crystal Ball Fortune</h3>
          </div>
          
          {/* Fortune text */}
          <div className={styles.fortuneArea}>
            <p className={styles.fortune}>{fortune}</p>
            
            {/* User answers if available */}
            {userAnswers && Object.values(userAnswers).some(answer => answer) && (
              <div className={styles.userAnswers}>
                <h4>Based on your answers:</h4>
                <ul>
                  {userAnswers.color && <li>Favorite color: {userAnswers.color}</li>}
                  {userAnswers.mood && <li>Current mood: {userAnswers.mood}</li>}
                  {userAnswers.dream && <li>Last dream: {userAnswers.dream}</li>}
                </ul>
              </div>
            )}
          </div>
          
          {/* QR code and share info */}
          {shareUrl && (
            <div className={styles.shareArea}>
              <div className={styles.qrCode}>
                <QRCode
                  value={shareUrl}
                  size={100}
                  style={{ width: "100%", height: "100%" }}
                  viewBox={`0 0 256 256`}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              <div className={styles.shareText}>
                <p>Scan this QR code with your phone</p>
                <p>to download your fortune</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

FortuneCard.displayName = 'FortuneCard';

export default FortuneCard; 