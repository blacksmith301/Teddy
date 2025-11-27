import React from 'react';
import { GeneratedImage } from '../types';

interface TreeGridProps {
  images: GeneratedImage[];
}

const TreeGrid: React.FC<TreeGridProps> = ({ images }) => {
  // We expect 10 images.
  // Layout:
  // Row 1: 1 image (Index 0)
  // Row 2: 2 images (Index 1, 2)
  // Row 3: 3 images (Index 3, 4, 5)
  // Row 4: 4 images (Index 6, 7, 8, 9)

  const getImagesForRange = (start: number, count: number) => {
    return images.slice(start, start + count);
  };

  const renderPhotoCard = (img: GeneratedImage, index: number) => (
    <div key={img.id} className="relative group bg-white p-2 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-all duration-300 hover:z-10 hover:scale-105">
      {/* Tape effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-yellow-400/80 rotate-2 shadow-sm z-20"></div>
      
      <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
         <img 
           src={img.url} 
           alt={`Christmas Portrait ${index + 1}`} 
           className="w-full h-full object-cover"
         />
         {/* Glossy overlay effect */}
         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 py-8 max-w-4xl mx-auto">
      {/* Star on top */}
      <div className="text-yellow-400 text-6xl drop-shadow-md animate-pulse mb-2">
        ★
      </div>

      {/* Row 1 */}
      <div className="flex justify-center w-full max-w-[200px]">
        {getImagesForRange(0, 1).map((img, i) => renderPhotoCard(img, 0 + i))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-4 w-full max-w-[420px]">
        {getImagesForRange(1, 2).map((img, i) => renderPhotoCard(img, 1 + i))}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center gap-4 w-full max-w-[640px]">
        {getImagesForRange(3, 3).map((img, i) => renderPhotoCard(img, 3 + i))}
      </div>

      {/* Row 4 */}
      <div className="flex justify-center gap-4 w-full max-w-[860px]">
        {getImagesForRange(6, 4).map((img, i) => renderPhotoCard(img, 6 + i))}
      </div>

      {/* Teddyy Branding Footer Area */}
      <div className="mt-8 text-center">
        <div className="flex justify-center items-end gap-4 mb-4">
             {/* Placeholder for the bears in the reference image - using emojis or generic icons for now */}
             <div className="text-6xl filter drop-shadow-lg">🧸</div>
             <div className="bg-white px-6 py-4 rounded-xl shadow-lg border-2 border-blue-200">
                <h3 className="text-2xl font-festive text-blue-500 font-bold">TEDDYY</h3>
                <p className="text-xs text-gray-500 tracking-wider">PREMIUM BABY DIAPERS</p>
             </div>
             <div className="text-6xl filter drop-shadow-lg transform scale-x-[-1]">🧸</div>
        </div>
        <h2 className="text-3xl md:text-5xl font-festive text-blue-500 drop-shadow-white stroke-2 font-bold mb-2">
           Make every moment magical
        </h2>
        <h2 className="text-3xl md:text-5xl font-festive text-pink-500 font-bold drop-shadow-md">
           MERRY CHRISTMAS!
        </h2>
      </div>
    </div>
  );
};

export default TreeGrid;