import React from 'react';
import { GeneratedImage } from '../types';

interface TreeGridProps {
  images: GeneratedImage[];
}

// Coordinate mapping for the 10-image tree (percentages relative to the template background)
// Tuned to align with the green boxes in the provided template.
const POSITIONS = [
  // Row 1 (1 image)
  { top: '12.8%', left: '41.3%', width: '17.2%', rotate: '-2deg' },
  // Row 2 (2 images)
  { top: '26.8%', left: '31.2%', width: '17.2%', rotate: '-3deg' },
  { top: '26.8%', left: '51.3%', width: '17.2%', rotate: '2deg' },
  // Row 3 (3 images)
  { top: '40.8%', left: '21.0%', width: '17.2%', rotate: '-2deg' },
  { top: '40.8%', left: '41.3%', width: '17.2%', rotate: '1deg' },
  { top: '40.8%', left: '61.6%', width: '17.2%', rotate: '-2deg' },
  // Row 4 (4 images)
  { top: '54.8%', left: '10.8%', width: '17.2%', rotate: '-3deg' },
  { top: '54.8%', left: '31.2%', width: '17.2%', rotate: '2deg' },
  { top: '54.8%', left: '51.4%', width: '17.2%', rotate: '-2deg' },
  { top: '54.8%', left: '71.8%', width: '17.2%', rotate: '3deg' },
];

// Using a direct link proxy for the imgur album content or the user provided image.
// Note: If this link expires, replace with the local asset or persistent URL.
const TEMPLATE_URL = "https://i.imgur.com/n4BXuQV.jpeg";

const TreeGrid: React.FC<TreeGridProps> = ({ images }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="relative w-full shadow-2xl rounded-sm overflow-hidden bg-white">
        {/* Background Template */}
        <img 
          src={TEMPLATE_URL} 
          alt="Christmas Tree Template" 
          className="w-full h-auto block"
          onError={(e) => {
            // Fallback if the direct imgur link fails (common with albums)
            (e.target as HTMLImageElement).src = "https://placehold.co/1080x1350/E0F7FA/1e293b?text=Template+Load+Error";
          }}
        />
        
        {/* Overlaid Generated Images */}
        {POSITIONS.map((pos, index) => {
          const img = images[index];
          // We render placeholders if the image hasn't generated yet so the user sees where they will go
          const imageUrl = img ? img.url : null;

          if (!imageUrl) return null;

          return (
            <div
              key={img?.id || index}
              className="absolute overflow-hidden bg-gray-200"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                aspectRatio: '1/1',
                transform: `rotate(${pos.rotate})`,
              }}
            >
              <img 
                src={imageUrl} 
                alt={`Portrait ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Subtle inner shadow to blend with the 'cutout' or frame look */}
              <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] pointer-events-none"></div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center text-slate-500 text-sm">
        <p>Your magical Christmas collage is ready to print!</p>
      </div>
    </div>
  );
};

export default TreeGrid;