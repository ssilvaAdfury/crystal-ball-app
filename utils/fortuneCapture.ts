import html2canvas from 'html2canvas';

interface CaptureOptions {
  quality?: number;
  scale?: number;
  backgroundColor?: string;
}

export async function captureElement(
  element: HTMLElement,
  options: CaptureOptions = {}
): Promise<{ dataUrl: string; blob: Blob }> {
  const { quality = 0.95, scale = 2, backgroundColor = 'rgba(26, 16, 64, 1)' } = options;
  
  try {
    // Wait longer to make sure element is fully rendered and images are loaded
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("Starting capture with dimensions:", element.offsetWidth, "x", element.offsetHeight);
    
    // Force any pending style updates to apply
    window.getComputedStyle(element).getPropertyValue('transform');
    
    // Wait for all images to load
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails
        });
      })
    );
    
    // Enhanced capture settings for better content handling
    const canvas = await html2canvas(element, {
      scale: scale,
      backgroundColor: backgroundColor,
      logging: true, // Enable logging for debugging
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      x: 0,
      y: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      onclone: (clonedDoc) => {
        // Ensure all elements in the clone are visible and properly positioned
        const clonedElement = clonedDoc.body.querySelector(`#${element.id}`) as HTMLElement;
        if (clonedElement) {
          // Make sure all elements are displayed properly
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              // Make sure opacity and visibility are properly set
              el.style.opacity = '1';
              el.style.visibility = 'visible';
              el.style.display = el.style.display || 'block';
            }
          });
        }
        return clonedDoc;
      }
    });
    
    console.log("Canvas created with dimensions:", canvas.width, "x", canvas.height);
    
    // Make sure we're getting a valid data URL
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    
    // Convert to blob for potential file saving
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.log("Blob creation failed, using fallback");
          // Fallback if blob creation fails
          fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => resolve(blob))
            .catch(() => {
              console.log("Fallback also failed, creating manual blob");
              resolve(new Blob([dataUrl], { type: 'image/jpeg' }));
            });
        } else {
          console.log("Blob created successfully, size:", blob.size);
          resolve(blob);
        }
      }, 'image/jpeg', quality);
    });
    
    console.log("Generated data URL length:", dataUrl.length);
    
    return { dataUrl, blob };
  } catch (error) {
    console.error('Error capturing element:', error);
    throw error;
  }
}

export function createDownloadLink(dataUrl: string, filename: string): string {
  // Safety check - make sure dataUrl starts with data:
  if (!dataUrl.startsWith('data:')) {
    console.error('Invalid data URL');
    return '';
  }
  
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename || 'crystal-ball-fortune.jpg';
  return link.href;
}

// Create a proper data URL specifically for QR code/sharing
export function generateShareUrl(dataUrl: string): string {
  // Log and validate the dataUrl
  console.log("Generating share URL from data URL length:", dataUrl.length);
  
  // For a real production app, you would:
  // 1. Upload the image to a server (S3, Firebase Storage, etc.)
  // 2. Create a short-lived public URL
  // 3. Return that URL for the QR code
  
  // Since we're in development/demo mode, create a simulated URL
  // In production, replace this with an actual upload and URL generation
  
  // Create a unique ID based on timestamp and random number
  const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  
  // Simulate a publicly accessible URL
  // In production, this would point to your actual domain
  return `https://crystal-ball-fortunes.example.com/share/${uniqueId}`;
}

// Function to handle mobile sharing if available
export async function shareFortune(dataUrl: string, text: string): Promise<boolean> {
  // Check if the Web Share API is available
  if (navigator.share) {
    try {
      // Convert data URL to blob for sharing
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'crystal-ball-fortune.jpg', { type: 'image/jpeg' });
      
      await navigator.share({
        title: 'My Crystal Ball Fortune',
        text: text,
        files: [file]
      });
      
      return true;
    } catch (error) {
      console.error('Error sharing fortune:', error);
      return false;
    }
  }
  
  return false;
} 