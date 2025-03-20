import { useEffect, useRef, useState } from 'react';

interface SpriteAnimationProps {
  idleSprite: string;
  actionSprite: string;
  frameWidth: number;
  frameHeight: number;
  displayWidth: number;
  displayHeight: number;
  idleFrameCount: number;
  actionFrameCount: number;
  fps: number;
  isPlaying: boolean;
  onActionComplete?: () => void;
}

export default function SpriteAnimation({
  idleSprite,
  actionSprite,
  frameWidth,
  frameHeight,
  displayWidth,
  displayHeight,
  idleFrameCount,
  actionFrameCount,
  fps,
  isPlaying,
  onActionComplete
}: SpriteAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isActionPlaying, setIsActionPlaying] = useState(false);
  const [idleImage, setIdleImage] = useState<HTMLImageElement | null>(null);
  const [actionImage, setActionImage] = useState<HTMLImageElement | null>(null);
  const actionCompleteRef = useRef(false);

  // Load sprite images
  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    Promise.all([
      loadImage(idleSprite),
      loadImage(actionSprite)
    ]).then(([idle, action]) => {
      setIdleImage(idle);
      setActionImage(action);
    });
  }, [idleSprite, actionSprite]);

  // Reset action complete flag when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      actionCompleteRef.current = false;
    }
  }, [isPlaying]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !idleImage || !actionImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastFrameTime = performance.now();
    const frameInterval = 1000 / fps; // milliseconds per frame

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTime;

      if (elapsed >= frameInterval) {
        ctx.clearRect(0, 0, frameWidth, frameHeight);

        if (isPlaying && !isActionPlaying && !actionCompleteRef.current) {
          setIsActionPlaying(true);
          setCurrentFrame(0);
        }

        const currentSprite = isActionPlaying ? actionImage : idleImage;
        const totalFrames = isActionPlaying ? actionFrameCount : idleFrameCount;

        ctx.drawImage(
          currentSprite,
          currentFrame * frameWidth,
          0,
          frameWidth,
          frameHeight,
          0,
          0,
          frameWidth,
          frameHeight
        );

        setCurrentFrame(prev => {
          const next = (prev + 1) % totalFrames;
          if (isActionPlaying && next === 0) {
            setIsActionPlaying(false);
            actionCompleteRef.current = true;
            if (onActionComplete) {
              setTimeout(onActionComplete, 0);
            }
          }
          return next;
        });

        lastFrameTime = timestamp - (elapsed % frameInterval); // Maintain frame timing accuracy
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentFrame, idleImage, actionImage, frameWidth, frameHeight, fps, isPlaying, isActionPlaying, idleFrameCount, actionFrameCount, onActionComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={frameWidth}
      height={frameHeight}
      style={{
        width: displayWidth,
        height: displayHeight,
        imageRendering: 'pixelated'
      }}
    />
  );
} 