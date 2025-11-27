import React, { useCallback, useState } from 'react';
import { UploadedImage } from '../types';

interface UploadZoneProps {
  onImagesSelected: (images: UploadedImage[]) => void;
  isLoading: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onImagesSelected, isLoading }) => {
  const [error, setError] = useState<string | null>(null);

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

    const processedImages: UploadedImage[] = [];

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Extract raw base64 data (remove "data:image/xyz;base64," prefix)
        const base64Data = base64.split(',')[1];

        processedImages.push({
          id: `${file.name}-${Date.now()}`,
          url: base64,
          base64Data,
          mimeType: file.type
        });
      } catch (e) {
        console.error("Error reading file", file.name, e);
      }
    }

    onImagesSelected(processedImages);
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
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={isLoading}
          />
          {isLoading ? 'Processing...' : 'Choose Photos'}
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