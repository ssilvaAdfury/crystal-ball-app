"use client";

import { useEffect, useState, useRef } from 'react';
import styles from './AnimatedBackground.module.css';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const frameCountRef = useRef<number>(12);
  const currentFrameRef = useRef<number>(0);
  const animationRef = useRef<number | NodeJS.Timeout | undefined>(undefined);
  
  useEffect(() => {
    const img = new Image();
    img.src = '/spr_backgroundTest.png';
    img.crossOrigin = "anonymous";
    
    // Function to render a specific frame
    const renderFrame = (frameIndex: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !img.complete) return;
      
      // Set canvas dimensions to match viewport
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate the source rectangle for the current frame
      const frameWidth = img.width / frameCountRef.current;
      const sourceX = frameIndex * frameWidth;
      
      // Draw the current frame centered and scaled to cover the canvas
      const scale = Math.max(canvas.width / frameWidth, canvas.height / img.height);
      const scaledWidth = frameWidth * scale;
      const scaledHeight = img.height * scale;
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;
      
      ctx.drawImage(
        img,
        sourceX, 0, frameWidth, img.height,
        x, y, scaledWidth, scaledHeight
      );
    };
    
    // Animation loop function
    const animate = () => {
      renderFrame(currentFrameRef.current);
      
      // Update frame index for next render
      currentFrameRef.current = (currentFrameRef.current + 1) % frameCountRef.current;
      
      // Schedule next frame render (about 5 FPS for 12 frames = ~2.4 seconds per cycle)
      animationRef.current = setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, 50); // 200ms between frames
    };
    
    // Start animation when image is loaded
    const handleImageLoad = () => {
      setImageLoaded(true);
      animate();
    };
    
    if (img.complete) {
      handleImageLoad();
    } else {
      img.onload = handleImageLoad;
    }
    
    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current && img.complete) {
        renderFrame(currentFrameRef.current);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up animation on unmount
    return () => {
      if (animationRef.current !== undefined) {
        if (typeof animationRef.current === 'number') {
          cancelAnimationFrame(animationRef.current);
        } else {
          clearTimeout(animationRef.current);
        }
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className={styles.container}>
      <canvas 
        ref={canvasRef} 
        className={styles.canvas}
        style={{
          display: imageLoaded ? 'block' : 'none',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
} 