
import React, { useCallback, useState } from 'react';
import { UploadedImage } from '../types';

interface UploadZoneProps {
  onImagesSelected: (images: UploadedImage[]) => void;
  isLoading: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onImagesSelected, isLoading }) => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const resizeAndCompressImage = (file: File): Promise<UploadedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800; // Resize to max 800px for faster API upload
          let width = img.width;
          let height = img.height;

          // Maintain aspect ratio
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG at 85% quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64Data = dataUrl.split(',')[1];
          
          resolve({
            id: `${file.name}-${Date.now()}`,
            url: dataUrl,
            base64Data,
            mimeType: 'image/jpeg'
          });
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array
    const fileArray: File[] = Array.from(files);

    if (fileArray.length < 3) {
      setError("Please select at least 3 photos for best results.");
      return;
    }

    setIsProcessing(true);
    const processedImages: UploadedImage[] = [];

    try {
      // Process images in parallel
      const promises = fileArray
        .filter(file => file.type.startsWith('image/'))
        .map(file => resizeAndCompressImage(file));

      const results = await Promise.all(promises);
      processedImages.push(...results);

      onImagesSelected(processedImages);
    } catch (e) {
      console.error("Error processing files", e);
      setError("Failed to process some images. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [onImagesSelected]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative group">
        {/* Soft Baby Blue Glow Behind */}
        <div className="absolute -inset-4 bg-sky-100 rounded-[3rem] blur-xl opacity-60 group-hover:opacity-80 transition duration-1000 group-hover:duration-500"></div>
        
        <div className="relative border-4 border-dashed border-sky-200 bg-white/80 backdrop-blur-md rounded-[2.5rem] p-10 md:p-20 text-center shadow-xl transition-all hover:border-sky-300 hover:bg-white/90">
          
          <div className="mb-10">
            <div className="w-28 h-28 bg-sky-50 text-sky-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-white transform group-hover:scale-110 transition-transform duration-500">
              {/* Generic Photo Icon instead of baby emoji */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="text-4xl font-festive text-sky-900 mb-4">Upload Your Photos</h3>
            <p className="text-slate-500 text-lg font-elegant max-w-md mx-auto leading-relaxed">
              Select <strong>3 to 10 photos</strong>. <br/>
              <span className="text-sm text-sky-500/80 mt-2 block">Tip: Clear faces and bright smiles work best!</span>
            </p>
          </div>

          <label className={`
            inline-flex items-center px-12 py-5 
            bg-gradient-to-r from-sky-300 to-sky-400
            text-white font-bold text-xl rounded-full cursor-pointer 
            shadow-lg shadow-sky-200/50
            transform transition-all duration-300 
            hover:scale-105 hover:shadow-sky-300/70 hover:from-sky-400 hover:to-sky-500
            active:scale-95 active:shadow-inner
            ${(isLoading || isProcessing) ? 'opacity-75 cursor-wait' : ''}
          `}>
            <span className="mr-3 text-2xl">❄️</span>
            <span className="tracking-wide font-sans drop-shadow-sm">
              {isProcessing ? 'Preparing...' : (isLoading ? 'Creating Magic...' : 'Choose Photos')}
            </span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
              disabled={isLoading || isProcessing}
            />
          </label>

          {error && (
            <div className="mt-10 p-4 bg-red-50 text-red-800 rounded-2xl border border-red-100 text-base font-medium animate-bounce-in">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
