import React, { useState, useEffect } from 'react';
import { AppStatus, GeneratedImage, UploadedImage, SCENARIOS } from './types';
import UploadZone from './components/UploadZone';
import TreeGrid from './components/TreeGrid';
import { checkApiKey, promptApiKey, generateChristmasCollage } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    // Check for API Key on mount
    checkApiKey().then(setHasKey);
  }, []);

  const handleApiKeyRequest = async () => {
    await promptApiKey();
    const keyExists = await checkApiKey();
    setHasKey(keyExists);
  };

  const handleImagesSelected = (images: UploadedImage[]) => {
    setUploadedImages(images);
  };

  const startGeneration = async () => {
    if (!hasKey) {
      await handleApiKeyRequest();
      // Double check after request
      if (!(await checkApiKey())) return;
    }

    if (uploadedImages.length < 3) {
      alert("Please upload at least 3 images.");
      return;
    }

    setStatus(AppStatus.GENERATING);
    setProgress(0);
    setGeneratedImages([]);

    try {
      const results = await generateChristmasCollage(uploadedImages, (count) => {
        setProgress(count);
      });
      setGeneratedImages(results);
      setStatus(AppStatus.COMPLETE);
    } catch (error) {
      console.error("Generation failed", error);
      setStatus(AppStatus.ERROR);
    }
  };

  const resetApp = () => {
    setStatus(AppStatus.IDLE);
    setUploadedImages([]);
    setGeneratedImages([]);
    setProgress(0);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🧸</span>
            <h1 className="text-2xl font-festive font-bold text-blue-600">Teddyy Magic</h1>
          </div>
          {!hasKey && (
             <button 
               onClick={handleApiKeyRequest}
               className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
             >
               Connect AI
             </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 pt-10">
        
        {/* Intro Section */}
        {status === AppStatus.IDLE && (
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-festive text-blue-600 mb-4 drop-shadow-sm">
              Baby's First Christmas Tree
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Upload your baby's photos and watch our AI weave them into a magical Christmas tree collage.
            </p>

            {!hasKey ? (
              <div className="p-8 bg-white rounded-2xl shadow-xl max-w-md mx-auto text-center">
                <p className="mb-4 text-gray-600">To create magic, we need to connect to the Gemini API.</p>
                <button 
                  onClick={handleApiKeyRequest}
                  className="bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:bg-yellow-300 transition-colors"
                >
                  Start Magic Engine ✨
                </button>
                <div className="mt-4 text-xs text-gray-400">
                  Powered by Google Gemini 2.5/3.0. 
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline ml-1">Billing info</a>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <UploadZone 
                  onImagesSelected={handleImagesSelected} 
                  isLoading={false} 
                />
                
                {uploadedImages.length > 0 && (
                  <div className="bg-white/60 p-6 rounded-2xl max-w-2xl mx-auto">
                    <h4 className="font-bold text-gray-700 mb-4">Selected Photos ({uploadedImages.length})</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                      {uploadedImages.map((img) => (
                        <div key={img.id} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 border-white shadow-md">
                          <img src={img.url} className="w-full h-full object-cover" alt="upload preview" />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={startGeneration}
                      disabled={uploadedImages.length < 3}
                      className={`mt-6 w-full py-4 rounded-xl text-xl font-festive font-bold text-white shadow-xl transition-all transform
                        ${uploadedImages.length < 3 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-[1.02]'
                        }
                      `}
                    >
                      GENERATE MAGIC COLLAGE ✨
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Generating State */}
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
            <p className="text-slate-500 mb-8">Designing photo {progress} of 10</p>
            
            <div className="w-full max-w-md bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-pink-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${(progress / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Results State */}
        {status === AppStatus.COMPLETE && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
               <button 
                 onClick={resetApp}
                 className="flex items-center text-blue-600 font-bold hover:underline"
               >
                 ← Start Over
               </button>
               <button 
                 onClick={() => window.print()}
                 className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-blue-700"
               >
                 Print Card 🖨️
               </button>
             </div>

             <div className="bg-gradient-to-b from-blue-50 to-blue-100 border-8 border-white shadow-2xl rounded-3xl p-4 md:p-12 max-w-5xl mx-auto mb-20 overflow-hidden relative">
               {/* Snow Overlay for effect */}
               <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 mix-blend-screen" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/snow.png)'}}></div>
               
               <TreeGrid images={generatedImages} />
             </div>
          </div>
        )}

        {/* Error State */}
        {status === AppStatus.ERROR && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold text-red-500 mb-4">Oh no! The magic faded.</h2>
            <p className="text-gray-600 mb-8">Something went wrong while generating the images. Please try again.</p>
            <button 
              onClick={resetApp}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;