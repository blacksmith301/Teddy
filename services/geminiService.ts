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
    Style: Professional photography, soft bokeh, warm pastel tones, magical Christmas atmosphere, sharp focus on eyes.
    Scenario: ${scenario}
    Ensure the baby's identity (hair, skin tone, general features) is consistent with the reference photos provided. 
    Do not include text or watermarks. Aspect Ratio 1:1.`
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
 * We run them in sequence or small batches to ensure stability.
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
  let completed = 0;

  // We will run these sequentially to avoid overwhelming the client/browser/rate-limits
  // In a production backend, these could be parallelized with queue management.
  for (let i = 0; i < SCENARIOS.length; i++) {
    try {
      const url = await generateSingleImage(ai, referenceImages, SCENARIOS[i]);
      results.push({
        id: `gen-${i}-${Date.now()}`,
        url,
        scenarioIndex: i,
        prompt: SCENARIOS[i]
      });
      completed++;
      onProgress(completed);
    } catch (error) {
      console.error(`Failed to generate scenario ${i}:`, error);
      // We continue even if one fails, to give the user partial results
      results.push({
        id: `fail-${i}`,
        url: "https://picsum.photos/1024/1024?grayscale", // Fallback placeholder if generation fails
        scenarioIndex: i,
        prompt: "Generation Failed"
      });
      completed++;
      onProgress(completed);
    }
  }

  return results;
};