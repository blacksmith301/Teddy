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
  
  // Add reference images (limit to 4 for token efficiency if needed)
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

  // Switch to gemini-3-pro-image-preview as requested
  // Note: 500x500 resolution is not supported by the API. "1K" (1024x1024) is the minimum size.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: parts,
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K", 
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
 * Optimized to run completely in parallel for maximum speed.
 */
export const generateChristmasCollage = async (
  referenceImages: UploadedImage[],
  onProgress: (count: number) => void
): Promise<GeneratedImage[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key.");
  }

  // Create a NEW instance to ensure key is fresh
  const ai = new GoogleGenAI({ apiKey });
  
  let completedCount = 0;
  
  // We fire all requests simultaneously. 
  // The browser will manage the connection queue (typically ~6 concurrent connections),
  // ensuring the fastest possible throughput without the "straggler" delays of batching.
  const promises = SCENARIOS.map(async (scenario, index) => {
    try {
      const url = await generateSingleImage(ai, referenceImages, scenario);
      completedCount++;
      onProgress(completedCount);
      return {
        id: `gen-${index}-${Date.now()}`,
        url,
        scenarioIndex: index,
        prompt: scenario,
        success: true
      };
    } catch (error) {
      console.error(`Failed to generate scenario ${index}:`, error);
      completedCount++;
      onProgress(completedCount);
      return {
        id: `fail-${index}`,
        url: "https://placehold.co/1024x1024/png?text=Retry", // Fallback
        scenarioIndex: index,
        prompt: "Generation Failed",
        success: false
      };
    }
  });

  // Wait for all to complete (UI updates progress individually via onProgress)
  const results = await Promise.all(promises);

  // Sort results by index to ensure they match the tree positions correctly
  return results.sort((a, b) => a.scenarioIndex - b.scenarioIndex);
};