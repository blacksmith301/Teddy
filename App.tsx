
import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { AppStatus, GeneratedImage, UploadedImage } from './types';
import UploadZone from './components/UploadZone';
import TreeGrid from './components/TreeGrid';
import SnowEffect from './components/SnowEffect';
import { checkApiKey, promptApiKey, generateChristmasCollage } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progress, setProgress] = useState<number>(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

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

  const handleDownload = async () => {
    const element = document.getElementById('collage-capture-target');
    if (element) {
      setIsDownloading(true);
      try {
        // Small delay to ensure images are fully rendered if just switched
        await new Promise(r => setTimeout(r, 500));
        
        const canvas = await html2canvas(element, {
          useCORS: true,
          scale: 2, // Higher resolution
          backgroundColor: '#ffffff', // Force white background for the download
        });
        
        const link = document.createElement('a');
        link.download = `teddyy-christmas-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Download failed:", err);
        alert("Could not download the collage. Please try taking a screenshot instead.");
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-600 pb-12">
      <SnowEffect />
      
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-16 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-festive text-sky-900 drop-shadow-sm mb-4 leading-tight">
            Teddyy <span className="text-sky-400">Christmas</span> Magic
          </h1>
          <div className="w-32 h-1.5 bg-sky-200 rounded-full mx-auto mb-6"></div>
          <p className="text-lg md:text-xl text-sky-800/70 font-elegant italic max-w-2xl mx-auto leading-relaxed">
            Turn your precious little moments into a frozen fairytale keepsake.
          </p>
        </header>

        <main className="relative z-10">
          {status === AppStatus.IDLE && (
            <div className="transform transition-all duration-700 hover:-translate-y-1">
              <UploadZone onImagesSelected={handleImagesSelected} isLoading={false} />
            </div>
          )}

          {status === AppStatus.GENERATING && (
            <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-sky-100 shadow-[0_8px_30px_rgb(186,230,253,0.2)] p-8 md:p-16 max-w-2xl mx-auto">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-4 border-sky-100 rounded-full"></div>
                <div className="absolute inset-0 border-t-4 border-sky-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce">
                  ☃️
                </div>
              </div>
              <h2 className="text-4xl font-festive text-sky-900 mb-4">Building a Snowman...</h2>
              <p className="text-sky-600/80 mb-8 font-medium tracking-wide text-lg">{Math.round((progress / 10) * 100)}% Magic Sprinkled</p>
              
              <div className="w-full max-w-md bg-sky-100 rounded-full h-6 overflow-hidden shadow-inner">
                <div 
                  className="bg-sky-400 h-full rounded-full transition-all duration-500 ease-out candy-stripe"
                  style={{ width: `${(progress / 10) * 100}%` }}
                ></div>
              </div>
              <p className="mt-8 text-base text-slate-400 italic max-w-md text-center font-elegant">
                Our snow elves are painting {10} portraits. This takes about a minute.
              </p>
            </div>
          )}

          {status === AppStatus.COMPLETE && (
            <div className="flex flex-col items-center space-y-12 animate-fade-in-up">
              <div className="w-full flex flex-col items-center">
                 <TreeGrid images={generatedImages} />
              </div>
             
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full">
                 <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="group relative px-10 py-4 bg-gradient-to-r from-sky-400 to-sky-500 text-white font-bold rounded-2xl shadow-lg shadow-sky-200/50 transition-all transform hover:-translate-y-1 hover:shadow-sky-300/60 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                  
                  {isDownloading ? (
                    <div className="flex items-center text-lg">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Wrapping Gift...
                    </div>
                  ) : (
                    <div className="flex items-center text-lg tracking-wide">
                      <span className="mr-2 text-xl">🎁</span> Download Keepsake
                    </div>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="px-8 py-4 text-sky-600 font-bold rounded-2xl hover:bg-white transition-all border-2 border-sky-100 hover:border-sky-200 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md text-lg tracking-wide"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {status === AppStatus.ERROR && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-[3rem] border border-red-100 p-12 max-w-md mx-auto shadow-2xl">
              <div className="text-7xl mb-6 animate-pulse">🌨️</div>
              <h3 className="text-4xl font-festive text-slate-800 mb-4">Brrr, it's cold!</h3>
              <p className="text-slate-500 mb-8 font-elegant text-lg">
                The holiday magic hit a little snag. Please check your connection and try again.
              </p>
              <button 
                onClick={handleReset}
                className="px-10 py-4 bg-sky-500 text-white font-bold rounded-2xl hover:bg-sky-600 shadow-lg transition-all transform hover:-translate-y-1"
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