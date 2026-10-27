export interface ModelBenchmark {
  id: string;
  name: string;
  type: 'Baseline' | 'Encoder-Decoder' | 'Prefix Tuning' | 'Pretrained VLM' | 'Multimodal LLM';
  parametersM: number;
  bleu1: number;
  bleu4: number;
  meteor: number;
  rougeL: number;
  cider: number;
  spice: number;
  latencyMs: number;
  chairRate: number; // Caption Hallucination Assessment and Image Recall % (lower is better)
  recommended?: boolean;
}

export const BENCHMARK_MODELS: ModelBenchmark[] = [
  {
    id: 'resnet-lstm',
    name: 'ResNet50 + LSTM (Bahdanau Attention)',
    type: 'Baseline',
    parametersM: 38.5,
    bleu1: 67.2,
    bleu4: 24.8,
    meteor: 0.22,
    rougeL: 51.4,
    cider: 0.72,
    spice: 0.15,
    latencyMs: 18,
    chairRate: 14.8,
  },
  {
    id: 'show-and-tell',
    name: 'Show & Tell (InceptionV3 + LSTM)',
    type: 'Encoder-Decoder',
    parametersM: 32.1,
    bleu1: 63.5,
    bleu4: 21.2,
    meteor: 0.19,
    rougeL: 48.7,
    cider: 0.61,
    spice: 0.12,
    latencyMs: 15,
    chairRate: 18.2,
  },
  {
    id: 'vit-gpt2',
    name: 'ViT-Base + GPT2 (Cross-Attention)',
    type: 'Encoder-Decoder',
    parametersM: 210.0,
    bleu1: 74.8,
    bleu4: 31.4,
    meteor: 0.26,
    rougeL: 55.2,
    cider: 0.98,
    spice: 0.19,
    latencyMs: 34,
    chairRate: 8.9,
  },
  {
    id: 'clipcap',
    name: 'ClipCap (CLIP ViT-B/32 + GPT-2 Prefix)',
    type: 'Prefix Tuning',
    parametersM: 238.0,
    bleu1: 76.2,
    bleu4: 33.5,
    meteor: 0.27,
    rougeL: 56.8,
    cider: 1.06,
    spice: 0.20,
    latencyMs: 31,
    chairRate: 7.4,
  },
  {
    id: 'blip',
    name: 'BLIP (Bootstrapping Image-Text Pretraining)',
    type: 'Pretrained VLM',
    parametersM: 385.0,
    bleu1: 82.4,
    bleu4: 39.4,
    meteor: 0.31,
    rougeL: 61.2,
    cider: 1.28,
    spice: 0.24,
    latencyMs: 42,
    chairRate: 3.8,
    recommended: true,
  },
  {
    id: 'instructblip',
    name: 'InstructBLIP (Vicuna-7B + Q-Former)',
    type: 'Multimodal LLM',
    parametersM: 7800.0,
    bleu1: 84.1,
    bleu4: 41.2,
    meteor: 0.33,
    rougeL: 62.8,
    cider: 1.34,
    spice: 0.26,
    latencyMs: 280,
    chairRate: 2.9,
  },
];

export const DATASET_SPLITS = [
  { name: 'Flickr8k', train: 6000, val: 1000, test: 1000, captionsPerImg: 5, domain: 'Daily Activities & Pets' },
  { name: 'Flickr30k', train: 29000, val: 1014, test: 1000, captionsPerImg: 5, domain: 'General Human Actions' },
  { name: 'MS-COCO 2014', train: 82783, val: 40504, test: 40775, captionsPerImg: 5, domain: 'Complex Scene Contexts' },
  { name: 'NoCaps (Zero-shot)', train: 0, val: 4500, test: 10600, captionsPerImg: 10, domain: 'Unseen Open-Vocabulary' },
];

export const HUMAN_EVALUATION_SCORES = [
  { model: 'ResNet50 + LSTM', fluency: 3.4, factual: 3.1, detail: 2.8, a11yUtility: 3.0 },
  { model: 'ViT-GPT2', fluency: 4.1, factual: 3.9, detail: 3.7, a11yUtility: 3.8 },
  { model: 'BLIP-Large (Selected)', fluency: 4.8, factual: 4.7, detail: 4.6, a11yUtility: 4.9 },
  { model: 'InstructBLIP', fluency: 4.9, factual: 4.8, detail: 4.8, a11yUtility: 4.7 },
];
