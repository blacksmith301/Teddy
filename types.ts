
export interface UploadedImage {
  id: string;
  url: string; // Base64 or Blob URL
  base64Data: string; // Pure Base64 for API
  mimeType: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  scenarioIndex: number;
  prompt: string;
  success?: boolean;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export const SCENARIOS = [
  "A close-up portrait of the baby smiling warmly, soft festive lighting, blurred Christmas tree in background.",
  "The baby wrapped snugly in a soft, chunky knit Christmas blanket, looking cozy and safe.",
  "The baby sitting beside a miniature Christmas tree, looking at the ornaments with wonder.",
  "The baby playing with safe, soft Christmas plush toys, joyful expression.",
  "The baby wearing a cute red and white Christmas onesie or elf costume.",
  "The baby crawling on a soft rug with twinkling fairy lights in the background (safe distance).",
  "The baby holding a small, beautifully wrapped gift box with a bow.",
  "The baby sitting in front of a window with a snowy winter glow outside, soft interior lighting.",
  "The baby clapping hands or laughing, celebrating the festive spirit.",
  "A magical portrait of the baby with subtle, golden festive sparkles floating in the air."
];
