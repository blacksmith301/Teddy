import React, { useState } from 'react';
import { AppStatus, GeneratedImage, UploadedImage } from './types';
import UploadZone from './components/UploadZone';
import TreeGrid from './components/TreeGrid';
import { checkApiKey, promptApiKey, generateChristmasCollage } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progress, setProgress] = useState<number>(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const handleImagesSelected = async (images: UploadedImage[]) => {
    try {
      // Check for API key before starting
      const hasKey = await checkApiKey();
      if (!hasKey) {
        await promptApiKey();
        // Check again after prompt
        const hasKeyAfter = await checkApiKey();
        if (!hasKeyAfter) {
          alert("API Key is required to generate images.");
          return;
        }
      }

      setStatus(AppStatus.GENERATING);
      setProgress(0);

      const results = await generateChristmasCollage(images, (completedCount) => {
        setProgress(completedCount);
      });

      setGeneratedImages(results);
      setStatus(AppStatus.COMPLETE);
    } catch (error) {
      console.error("Generation failed:", error);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setGeneratedImages([]);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-600 mb-4">
            Baby's First Christmas Tree
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload photos of your baby to generate a magical Christmas tree collage powered by Google Gemini.
          </p>
        </header>

        <main>
          {status === AppStatus.IDLE && (
            <UploadZone onImagesSelected={handleImagesSelected} isLoading={false} />
          )}

          {status === AppStatus.GENERATING && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-8 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">
                  🎄
                </div>
              </div>
              <h2 className="text-3xl font-festive text-blue-600 mb-2">Creating Christmas Magic...</h2>
              <p className="text-slate-500 mb-8">{Math.round((progress / 10) * 100)}% Complete</p>
              
              <div className="w-full max-w-md bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-pink-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${(progress / 10) * 100}%` }}
                ></div>
              </div>
              <p className="mt-4 text-sm text-slate-500 italic max-w-md text-center">
                Images are being designed. This usually takes 1 to 2 minutes.
              </p>
            </div>
          )}

          {status === AppStatus.COMPLETE && (
            <div className="flex flex-col items-center">
              <TreeGrid images={generatedImages} />
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-slate-800 text-white font-bold rounded-full hover:bg-slate-700 transition-colors shadow-lg"
                >
                  Create Another Collage
                </button>
              </div>
            </div>
          )}

          {status === AppStatus.ERROR && (
            <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100 p-8 max-w-md mx-auto">
              <div className="text-4xl mb-4">🎅</div>
              <h3 className="text-xl font-bold text-red-600 mb-2">Ho Ho No! Something went wrong.</h3>
              <p className="text-red-500 mb-6">We couldn't generate the collage. Please check your connection and try again.</p>
              <button 
                onClick={handleReset}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;