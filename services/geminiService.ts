import { GoogleGenAI } from "@google/genai";
import { UploadedImage, GeneratedImage, SCENARIOS } from "../types";

export const checkApiKey = async (): Promise<boolean> => {
  const win = window as any;
  if (win.aistudio) {
    return await win.aistudio.hasSelectedApiKey();
  }
  return false;
};

export const promptApiKey = async (): Promise<void> => {
  const win = window as any;
  if (win.aistudio) {
    await win.aistudio.openSelectKey();
  }
};

/**
 * Generates a single image based on a prompt and reference images.
 */
const generateSingleImage = async (
  ai: GoogleGenAI,
  referenceImages: UploadedImage[],
  scenario: string
): Promise<string> => {
  // Construct parts: Prompt + Reference Images
  const parts: any[] = [];
  
  // Add reference images (limit to 3 for token efficiency if needed, but SDK handles it)
  referenceImages.slice(0, 4).forEach((img) => {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64Data,
      },
    });
  });

  // Add the text prompt
  parts.push({
    text: `Generate a high-quality, photorealistic Christmas-themed baby portrait. 
    Subject: A baby resembling the features in the provided reference images. 
    Style: Professional studio photography, soft bokeh, warm pastel tones, magical Christmas atmosphere.
    Scenario: ${scenario}
    Constraints: 
    - Output must be a clean, borderless square image.
    - NO white frames, NO polaroid borders, NO text, NO watermarks.
    - Full bleed composition.
    - Ensure the baby's identity (hair, skin tone, general features) is consistent with the reference photos.
    Aspect Ratio 1:1.`
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: parts,
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    },
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image data returned from API");
};

/**
 * Orchestrates the generation of all 10 images.
 * Optimized to run in batches to speed up the process while respecting rate limits.
 */
export const generateChristmasCollage = async (
  referenceImages: UploadedImage[],
  onProgress: (count: number) => void
): Promise<GeneratedImage[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key.");
  }

  // Create a NEW instance each time to ensure key is fresh
  const ai = new GoogleGenAI({ apiKey });
  
  const results: GeneratedImage[] = [];
  let completedCount = 0;
  const BATCH_SIZE = 3; // Generate 3 images at a time to speed up process

  for (let i = 0; i < SCENARIOS.length; i += BATCH_SIZE) {
    const batchScenarios = SCENARIOS.slice(i, i + BATCH_SIZE);
    
    // Create a batch of promises
    const batchPromises = batchScenarios.map(async (scenario, index) => {
      const actualIndex = i + index;
      try {
        const url = await generateSingleImage(ai, referenceImages, scenario);
        return {
          id: `gen-${actualIndex}-${Date.now()}`,
          url,
          scenarioIndex: actualIndex,
          prompt: scenario,
          success: true
        };
      } catch (error) {
        console.error(`Failed to generate scenario ${actualIndex}:`, error);
        return {
          id: `fail-${actualIndex}`,
          url: "https://placehold.co/1024x1024/png?text=Retry", // Fallback
          scenarioIndex: actualIndex,
          prompt: "Generation Failed",
          success: false
        };
      }
    });

    // Wait for the current batch to finish
    const batchResults = await Promise.all(batchPromises);

    // Add to results and update progress
    batchResults.forEach(res => {
      results.push(res);
      completedCount++;
    });
    
    onProgress(completedCount);
  }

  // Sort results by index to ensure they match the tree positions correctly
  return results.sort((a, b) => a.scenarioIndex - b.scenarioIndex);
};