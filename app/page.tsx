"use client";

import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import "./styles.css";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import FortuneCard from "@/components/FortuneCard";
import { captureElement, generateShareUrl } from "@/utils/fortuneCapture";
import SpriteAnimation from "../components/SpriteAnimation";

export default function HomePage() {
    const [fortune, setFortune] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [color, setColor] = useState("");
    const [mood, setMood] = useState(""); 
    const [dream, setDream] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [isCapturing, setIsCapturing] = useState(false);
    const fortuneCardRef = useRef<HTMLDivElement>(null);
    const [hasGeneratedFortune, setHasGeneratedFortune] = useState(false);
  
    // Toggle this to true when you want to use AI for fortune generation
    const usingAI = true;

    const handleReset = () => {
      setColor("");
      setMood("");
      setDream("");
    }

    const handleGetFortune = async () => {
      if (fortune) {
        // If there's an existing fortune, fade it out first
        setIsFading(true);
        setShowButton(false);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for fade-out
      }
      
      setIsGenerating(true);
      setShowButton(false); // Ensure button is hidden during generation
      setFortune(""); // Clear the fortune during generation
      setHasGeneratedFortune(false); // Reset the hasGeneratedFortune state
      handleReset();

      if (usingAI) {
        try {
          const response = await fetch("/api", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userAnswers: { color, mood, dream },
            }),
          });
          if (!response.ok) {
            throw new Error("Failed to fetch fortune");
          }
          const data = await response.json();
          
          // Set the fortune first
          setFortune(data.fortune);
          setHasGeneratedFortune(true);
          setIsFading(false);
          
          
          // Wait for fortune to be visible before showing button
          setTimeout(() => {
            if (!isGenerating) {
              setShowButton(true);
            }
          }, 1000);
        } catch (error) {
          console.error("Error generating fortune:", error);
          setIsFading(false);
          setFortune("The crystal ball is silent... Try again later.");
          setHasGeneratedFortune(true);
          // Add delay for error case as well
          setTimeout(() => {
            setShowButton(true);
          }, 1000);
        }
      }
      
      // The animation will automatically complete and reset isGenerating
      // through the onActionComplete callback
    };
  
    // Helper function to capture with html2canvas
    const captureWithHtml2Canvas = async () => {
      // Create a container that doesn't affect layout but is visible to html2canvas
      const captureDiv = document.createElement('div');
      captureDiv.style.position = 'absolute';
      captureDiv.style.left = '-9999px';
      captureDiv.style.top = '-9999px';
      captureDiv.style.width = '400px';
      captureDiv.style.height = 'auto';
      captureDiv.style.backgroundColor = '#1a1040';
      captureDiv.style.padding = '20px';
      captureDiv.style.borderRadius = '16px';
      // Don't set visibility:hidden as it may affect rendering
      
      // Skip the image and just use text
      captureDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <img src="${window.location.origin}/adfuryLogo2.png" width="80" height="80" style="margin: 0 auto 10px auto; display: block;">
        </div>
        <div style="background-color: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px;">
          <p style="font-size: 18px; line-height: 1.5; text-align: center; color: #ffffff;">
            ${fortune}
          </p>
        </div>
      `;
      
      // Add to document
      document.body.appendChild(captureDiv);
      
      try {
        console.log("Starting html2canvas capture...");
        
        // Dynamically import html2canvas
        const html2canvas = (await import('html2canvas')).default;
        
        // Preload the image to ensure it's available
        const preloadImage = (src: string): Promise<void> => {
          return new Promise((resolve) => {
            const img = document.createElement('img') as HTMLImageElement;
            img.onload = () => {
              console.log(`Preloaded image: ${src}`);
              resolve();
            };
            img.onerror = () => {
              console.error(`Failed to preload image: ${src}`);
              // Resolve anyway to continue the process
              resolve();
            };
            img.src = src;
          });
        };
        
        // Preload the crystal ball image
        await preloadImage('/adfuryLogo2.png');
        
        // Wait for images to load
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("Waited for images to load");
        
        try {
          // Simplified options
          const canvas = await html2canvas(captureDiv, {
            scale: 2,
            backgroundColor: '#1a1040',
            logging: false,
            useCORS: true,
            allowTaint: true,
            ignoreElements: (element) => {
              // Ignore elements that might cause issues
              return element.tagName === 'BUTTON' || 
                    element.classList.contains('drawer-content');
            },
            onclone: (documentClone) => {
              // Convert problematic oklch colors to standard hex/rgb
              const allElements = documentClone.querySelectorAll('*');
              allElements.forEach(el => {
                if (el instanceof HTMLElement) {
                  const computedStyle = window.getComputedStyle(el);
                  // Copy styles to inline, but convert oklch to hex/rgb values
                  const bgcolor = computedStyle.backgroundColor;
                  const color = computedStyle.color;
                  const borderColor = computedStyle.borderColor;
                  
                  // Only set if they don't contain oklch
                  if (bgcolor && !bgcolor.includes('oklch')) {
                    el.style.backgroundColor = bgcolor;
                  } else if (bgcolor && bgcolor.includes('oklch')) {
                    el.style.backgroundColor = '#1a1040'; // Fallback dark purple
                  }
                  
                  if (color && !color.includes('oklch')) {
                    el.style.color = color;
                  } else if (color && color.includes('oklch')) {
                    el.style.color = '#ffffff'; // Fallback white
                  }
                  
                  if (borderColor && !borderColor.includes('oklch')) {
                    el.style.borderColor = borderColor;
                  } else if (borderColor && borderColor.includes('oklch')) {
                    el.style.borderColor = 'rgba(255, 255, 255, 0.1)'; // Fallback border
                  }
                }
              });
              
              // Ensure images are loaded
              const imgElements = documentClone.querySelectorAll('img');
              imgElements.forEach(img => {
                // Force reload the image if needed
                if (img.src) {
                  const originalSrc = img.src;
                  img.src = originalSrc;
                }
              });
              
              console.log("Document cloned and colors processed");
              return documentClone;
            }
          });
          
          console.log("Canvas created, converting to blob...");
          
          // Use a more reliable download approach
          return new Promise<void>((resolve, reject) => {
            try {
              // Convert to data URL first
              const dataURL = canvas.toDataURL('image/png', 0.95);
              
              // For iOS, open in new window with proper content type
              if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                  newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>adentus_furiosi_fortune.png</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="Content-Type" content="image/png">
                      </head>
                      <body style="margin:0;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#fff;">
                        <div style="margin:20px;text-align:center;">adentus_furiosi_fortune.png</div>
                        <img src="${dataURL}" style="max-width:90%;height:auto;margin:20px;">
                      </body>
                    </html>
                  `);
                  newWindow.document.close();
                }
                resolve();
              } else {
                // For other devices, use the iframe download approach
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!iframeDoc) {
                  throw new Error("Could not access iframe document");
                }
                
                const link = iframeDoc.createElement('a');
                link.href = dataURL;
                link.download = 'adentus_furiosi_fortune.png';
                iframeDoc.body.appendChild(link);
                link.click();
                
                // Clean up after a delay
                setTimeout(() => {
                  document.body.removeChild(iframe);
                  resolve();
                }, 100);
              }
              resolve();
            } catch (error) {
              console.error("Error in download process:", error);
              reject(error);
            }
          });
        } catch (innerError) {
          console.error("HTML2Canvas specific error:", innerError);
          
          // Check if this is the oklch error
          if (innerError instanceof Error && 
              innerError.message && 
              innerError.message.includes("unsupported color function")) {
            console.log("Detected oklch color error, trying fallback approach...");
            return await createTextBasedFortune();
          }
          
          throw innerError; // Re-throw if it's a different error
        }
      } catch (error) {
        console.error("Detailed error capturing fortune:", error);
        throw error; // Re-throw to trigger fallback
      } finally {
        // Always clean up
        document.body.removeChild(captureDiv);
      }
    };
    
    // Pure canvas-based approach as fallback
    const createTextBasedFortune = async () => {
      // Create a canvas directly
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 400; // Make taller to accommodate the image
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Couldn't get canvas context");
      }
      
      // Simple solid background
      ctx.fillStyle = '#1a1040';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw crystal ball image
      const img = document.createElement('img') as HTMLImageElement;
      img.crossOrigin = "anonymous"; // Try to avoid CORS issues
      
      console.log("Attempting to load image from:", window.location.origin + "/adfuryLogo2.png");
      
      // Create a promise to wait for image loading
      await new Promise<boolean>((resolve) => {
        img.onload = () => {
          // Draw image centered at the top
          console.log("Image loaded successfully");
          ctx.drawImage(img, canvas.width/2 - 40, 20, 80, 80);
          resolve(true);
        };
        img.onerror = () => {
          console.error("Error loading AdFury logo from:", window.location.origin + "/adfuryLogo2.png");
          resolve(false); // Continue even if image fails
        };
        img.src = window.location.origin + "/adfuryLogo2.png";
        
        // Set a timeout to prevent hanging if image never loads
        setTimeout(() => resolve(false), 1000);
      });
      
      // Draw a divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(50, 140);
      ctx.lineTo(canvas.width - 50, 140);
      ctx.stroke();
      
      // Draw fortune text
      ctx.font = '16px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      
      // Word wrapping for fortune text
      const words = fortune.split(' ');
      let line = '';
      let y = 180; // Start position for text
      const maxWidth = canvas.width - 60;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width/2, y);
          line = words[i] + ' ';
          y += 24;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width/2, y);
      
      // Convert canvas to blob and download
      return new Promise<void>((resolve, reject) => {
        try {
          // Use data URL approach for more reliable downloads
          const dataURL = canvas.toDataURL('image/png', 0.95);
          
          // For iOS, open in new window with proper content type
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'adentus_furiosi_fortune.png';
            link.target = '_blank';
            link.click();
            resolve();
          } else {
            // For other devices, use the iframe download approach
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!iframeDoc) {
              throw new Error("Could not access iframe document");
            }
            
            const link = iframeDoc.createElement('a');
            link.href = dataURL;
            link.download = 'adentus_furiosi_fortune.png';
            iframeDoc.body.appendChild(link);
            link.click();
            
            // Clean up after a delay
            setTimeout(() => {
              document.body.removeChild(iframe);
              resolve();
            }, 100);
          }
          resolve();
        } catch (error) {
          console.error("Error in canvas fallback:", error);
          reject(error);
        }
      });
    };

    // Capture the fortune card when the drawer is opened
    useEffect(() => {
      async function captureCard() {
        if (isDrawerOpen && fortuneCardRef.current && fortune) {
          try {
            // Use temporary URL until real capture is done
            setShareUrl("https://example.com/fortune-placeholder");
            
            // Wait longer to ensure card is fully rendered (500ms → 1000ms)
            setTimeout(async () => {
              console.log("Attempting to capture fortune card...");
              const { dataUrl } = await captureElement(fortuneCardRef.current!, {
                quality: 0.9,
                scale: 2
              });
              console.log("Capture successful, URL length:", dataUrl.length);
              
              // Update the share URL with the captured image
              setShareUrl(generateShareUrl(dataUrl));
            }, 1000); // Increased timeout for rendering
          } catch (error) {
            console.error("Error capturing fortune card:", error);
            // Fallback to a placeholder URL if capture fails
            setShareUrl("https://example.com/fortune-error");
          }
        }
      }
      
      captureCard();
    }, [isDrawerOpen, fortune]);
    
  return (
      <main className="relative min-h-screen w-screen overflow-x-hidden flex flex-col items-center justify-center text-gray-100 text-shadow">
        {/* Animated Background */}
        <AnimatedBackground />
        
        {/* Semi-transparent overlay with dynamic opacity */}
        <div 
          className={`overlay fixed inset-0 w-screen h-screen transition-all duration-500 ease-in-out ${
            isGenerating 
              ? 'bg-black/70 backdrop-blur-lg' 
              : 'bg-black/30'
          }`} 
        />

        {/* Content */}
        <div className={`relative z-10 w-full max-w-7xl flex flex-col items-center px-4 transition-all duration-500 ${
          isGenerating ? 'opacity-90' : 'opacity-100'
        }`}>
          {/* Main content container with responsive layout */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
            {/* Left side: Crystal Ball and Fortune - with fixed height container */}
            <div className="flex flex-col items-center w-full lg:w-1/2 min-h-[600px] lg:min-h-[700px]">
              {/* Crystal ball animation container */}
              <div
                className="cursor-pointer relative mb-2 md:mb-4 transform scale-90 md:scale-100"
                onClick={handleGetFortune}
              >
                <SpriteAnimation
                  idleSprite="/spr_adentusFuriosi_idleAnim2.png"
                  actionSprite="/spr_adentusFuriosi_animFile2.png"
                  frameWidth={640}
                  frameHeight={640}
                  displayWidth={480}
                  displayHeight={480}
                  idleFrameCount={11}
                  actionFrameCount={20}
                  fps={10}
                  isPlaying={isGenerating}
                  onActionComplete={() => setIsGenerating(false)}
                />
              </div>

              {/* Fortune display with adjusted spacing */}
              <div className="min-h-[150px] md:min-h-[200px] w-full max-w-md flex flex-col items-center justify-start px-2 md:px-4 mt-[-50px]">
                {(fortune || isFading) ? (
                  <>
                    <p className={`p-3 md:p-4 w-full text-center border border-purple-300/30 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl text-gray-100/90 ${
                      isFading ? 'fade-out' : 'fade-in'
                    }`}>
                      {fortune}
                    </p>
                    
                    {/* Share Button - Only render after fortune is fully visible */}
                    {hasGeneratedFortune && !isGenerating && !isFading && showButton && (
                      <div className="fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
                        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                          <DrawerTrigger asChild>
                            <Button 
                              className="mt-4 w-48 text-white font-medium hover:brightness-110 transition-all duration-200"
                              style={{
                                background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
                                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.35)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              Save Fortune
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent className="drawer-content">
                            <div 
                              className="mx-auto w-full max-w-md p-4 sm:p-6 max-h-[80vh] overflow-y-auto"
                              onClick={(e) => {
                                // Prevent clicks within the drawer from bubbling up
                                e.stopPropagation();
                              }}
                            >
                              <DrawerTitle className="sr-only">Your Fortune Card</DrawerTitle>
                              
                              <div className="mb-6">
                                <FortuneCard 
                                  ref={fortuneCardRef}
                                  fortune={fortune} 
                                  shareUrl={shareUrl}
                                  userAnswers={{ color, mood, dream }}
                                />
                              </div>
                              
                              <div className="flex flex-col w-full">
                                <p className="text-center text-sm font-semibold text-white mb-3">Save your fortune:</p>
                                
                                <Button 
                                  className={`w-full mb-4 text-white font-medium transition-all duration-200 ${
                                    isCapturing ? 'generating-gradient' : 'hover:brightness-110'
                                  }`}
                                  style={{
                                    background: isCapturing ? undefined : 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
                                    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.35)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                  }}
                                  disabled={isCapturing}
                                  onClick={async (e) => {
                                    // Prevent event propagation to avoid drawer interactions
                                    e.stopPropagation();
                                    
                                    if (isCapturing) return;
                                    
                                    // Show loading state
                                    setIsCapturing(true);
                                    const button = document.activeElement as HTMLButtonElement;

                                    try {
                                      console.log("Starting capture process...");
                                      
                                      // Force focus to remain in the drawer
                                      const maintainFocus = () => {
                                        // Keep re-focusing on the button while capturing
                                        if (button && document.body.contains(button)) {
                                          button.focus();
                                        }
                                      };
                                      
                                      // Start repeatedly focusing on the button
                                      const focusInterval = setInterval(maintainFocus, 50);
                                      
                                      try {
                                        await captureWithHtml2Canvas();
                                        console.log("Fortune capture successful");
                                      } catch (error: Error | unknown) {
                                        // Silently handle the oklch error if it happens
                                        if (error instanceof Error && error.message.includes("unsupported color function")) {
                                          console.log("Working around the oklch color function error...");
                                          await createTextBasedFortune();
                                          console.log("Fallback fortune capture successful");
                                        } else {
                                          // Only rethrow if it's not the oklch error
                                          throw error;
                                        }
                                      } finally {
                                        // Stop the focus maintenance
                                        clearInterval(focusInterval);
                                      }
                                    } catch (error) {
                                      console.error("Fatal error in fortune capture:", error);
                                      alert("Failed to capture fortune. Please try again.");
                                    } finally {
                                      // Always reset the state, regardless of success or failure
                                      setIsCapturing(false);
                                      
                                      // Reset focus
                                      if (button) {
                                        // Force focus back to the button after a delay
                                        setTimeout(() => {
                                          button.focus();
                                        }, 50);
                                      }
                                    }
                                  }}
                                >
                                  {isCapturing ? 'Capturing...' : 'Download as Image'}
                                </Button>
                                
                                <Button 
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    const button = e.currentTarget;
                                    
                                    // Store the current focus state
                                    const focusInterval = setInterval(() => {
                                      button.focus();
                                    }, 50);

                                    try {
                                      await navigator.clipboard.writeText(fortune);
                                      const originalText = button.innerText;
                                      button.innerText = "Copied!";
                                      setTimeout(() => {
                                        button.innerText = originalText;
                                      }, 2000);
                                    } catch (err) {
                                      console.error('Failed to copy: ', err);
                                      alert('Failed to copy text');
                                    } finally {
                                      // Clear the focus interval after a delay
                                      setTimeout(() => {
                                        clearInterval(focusInterval);
                                      }, 500);
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 w-full mb-6"
                                >
                                  Copy as Text
                                </Button>

                                {/* Website Visit Section */}
                                <p className="text-center text-sm font-semibold text-white mb-3">Visit our website for any marketing needs!</p>
                                <Button 
                                  onClick={() => {
                                    window.open('https://adfury.ai', '_blank');
                                  }}
                                  className="w-full mb-6 text-white font-medium hover:brightness-110 transition-all duration-200"
                                  style={{
                                    background: 'linear-gradient(135deg, #ff8a00 0%, #ff4d00 50%, #ff2d00 100%)',
                                    boxShadow: '0 4px 10px rgba(255, 69, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                  }}
                                >
                                  AdFury.ai
                                </Button>

                                <p className="text-center text-sm font-semibold text-white mb-3">Share on social media:</p>
                                <div className="flex justify-center gap-4 flex-wrap">
                                  <Button 
                                    onClick={() => {
                                      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent('Check out my crystal ball fortune: ' + fortune)}`;
                                      window.open(url, '_blank', 'width=600,height=400');
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 flex-1 md:flex-none"
                                  >
                                    Facebook
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent( fortune + ' 𝐔𝐧𝐥𝐨𝐜𝐤 𝐲𝐨𝐮𝐫 𝐦𝐚𝐫𝐤𝐢𝐧𝐠 𝐩𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥: https://www.adfury.ai')}`; /*These are special Unicode characters. Ask claude to fix this if it's too weird.*/
                                      window.open(url, '_blank', 'width=600,height=400');
                                    }}
                                    className="bg-black hover:bg-gray-800 px-4 flex-1 md:flex-none"
                                  >
                                    X
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      window.open('https://www.instagram.com', '_blank');
                                    }}
                                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 px-4 flex-1 md:flex-none"
                                  >
                                    Instagram
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    )}
                  </>
                ) : (
                  // Adjusted placeholder heights
                  <div className="w-full flex flex-col items-center">
                    <div className="p-3 md:p-4 w-full h-[60px] md:h-[72px]"></div>
                    <div className="h-[48px] md:h-[58px]"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side: Questionnaire - adjusted responsive margins */}
            <div className="w-full max-w-sm lg:max-w-xs text-gray-200 border border-purple-300/30 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl p-3 md:p-4 mt-20 md:mt-16 lg:mt-[-50px] relative z-10">
              <p className="mb-2 p-2 text-center sm:text-left text-gray-100/90">Tell me about yourself, so that I may find the answers to what you seek:</p>
              <form className="space-y-3 md:space-y-4">
                <div>
                  <label className="block mb-1 text-sm sm:text-base text-gray-100/90">First color that comes to mind:</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/20 border border-purple-300/30 backdrop-blur-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                    placeholder="Any color will do..."
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm sm:text-base text-gray-100/90">How are you feeling today?:</label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/20 border border-purple-300/30 backdrop-blur-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                    placeholder="Describe your mood..."
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm sm:text-base text-gray-100/90">Share the most recent dream you remember:</label>
                  <input
                    type="text"
                    value={dream}
                    onChange={(e) => setDream(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/20 border border-purple-300/30 backdrop-blur-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                    placeholder="Tell me about your dream..."
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleGetFortune}
                  className={`w-full mt-6 text-white font-medium transition-all duration-200 ${
                    isGenerating ? 'generating-gradient' : 'hover:brightness-110'
                  }`}
                  style={{
                    background: isGenerating ? undefined : 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
                    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {isGenerating ? 'Generating...' : 'Generate Fortune'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
  );
}

