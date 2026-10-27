export interface TokenConfidence {
  word: string;
  conf: string;
  logProb?: number;
  bbox?: { top: string; left: string; width: string; height: string };
  focusCoord?: { top: string; left: string; label: string; alpha: string };
}

export interface SampleData {
  id: string;
  code: string;
  title: string;
  imgUrl: string;
  thumbUrl: string;
  dataAlt: string;
  baseline: string;
  baselineMetrics: {
    bleu4: number;
    cider: number;
    meteor: number;
    latencyMs: number;
  };
  sota: string;
  sotaMetrics: {
    bleu4: number;
    cider: number;
    spice: number;
    latencyMs: number;
  };
  zeroShotMetrics: {
    baseline: { bleu4: number; cider: number; meteor: number; latencyMs: number };
    sota: { bleu4: number; cider: number; spice: number; latencyMs: number };
  };
  tokens: TokenConfidence[];
  translations: Record<string, string>;
  phonetics: string;
  phoneticsDetail: {
    ipa: string;
    arpabet: string;
    syllables: string[];
  };
  braille: string;
  focusCoord: { top: string; left: string; label: string; alpha: string };
  secondaryBbox: { top: string; left: string; width: string; height: string; label: string };
  coordPixels: { x: number; y: number };
}

export type ViewTab = 'live-demo' | 'benchmark-study' | 'attention-maps' | 'methodology-dataset';
export type WorkbenchMode = 'a11y' | 'research';

export interface AccessibilitySettings {
  highContrast: boolean;
  speechRate: number;
  speechPitch: number;
  autoSpeak: boolean;
  haptics: boolean;
  soundEffects: boolean;
  fontSize: 'standard' | 'large' | 'xlarge';
}
