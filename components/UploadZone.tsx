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
    <div className="w-full max-w-2xl mx-auto">
      <div className="border-4 border-dashed border-blue-300 bg-white/50 rounded-3xl p-8 text-center hover:bg-white/80 transition-colors">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            📷
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Upload Baby Photos</h3>
          <p className="text-gray-500 mb-6">
            Select <strong>3 to 10 photos</strong> of your baby. Clear, close-up shots of the face work best!
          </p>
        </div>

        <label className={`
          inline-block px-8 py-4 bg-pink-500 text-white font-bold rounded-full cursor-pointer 
          shadow-lg transform transition-transform hover:scale-105 active:scale-95
          ${(isLoading || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={isLoading || isProcessing}
          />
          {isProcessing ? 'Optimizing Images...' : (isLoading ? 'Processing...' : 'Choose Photos')}
        </label>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm font-semibold">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;