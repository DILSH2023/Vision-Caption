/**
 * Audio and Accessibility Utilities for VisionCaption
 */

// Web Audio API Context singleton
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Trigger subtle physical vibration haptic
 */
export function triggerHaptic(duration: number | number[] = 40): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration error
    }
  }
}

/**
 * Synthesizes a subtle tactile tone (auditory haptic) for accessibility feedback
 */
export function playHapticTone(type: 'tap' | 'pulse' | 'success' | 'alert' = 'pulse'): void {
  triggerHaptic([30, 40, 30]);
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'pulse') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch {
    // Web audio error gracefully swallowed
  }
}

/**
 * Text-to-Speech Controller with Web Speech API
 */
export class SpeechController {
  private static instance: SpeechController;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public static getInstance(): SpeechController {
    if (!SpeechController.instance) {
      SpeechController.instance = new SpeechController();
    }
    return SpeechController.instance;
  }

  public speak(
    text: string,
    lang = 'en',
    rate = 1.0,
    pitch = 1.0,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void
  ): boolean {
    if (!this.synth) return false;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Map language code to BCP 47
    const langMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      hi: 'hi-IN',
      ja: 'ja-JP',
      ar: 'ar-SA',
      de: 'de-DE',
      zh: 'zh-CN',
    };
    utterance.lang = langMap[lang] || 'en-US';

    // Find best matching voice
    const voices = this.synth.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(lang) || v.lang.startsWith(utterance.lang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (onError) onError();
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public getSpeaking(): boolean {
    return this.isSpeaking || (this.synth ? this.synth.speaking : false);
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }
}

/**
 * Basic English to Grade 1 Braille Unicode mapper
 */
export function textToBraille(text: string): string {
  const brailleMap: Record<string, string> = {
    a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑', f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
    k: '⠇', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞',
    u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽', z: '⠵',
    ' ': ' ', '.': '⠲', ',': '⠂', '!': '⠖', '?': '⠦', '-': '⠤',
    '0': '⠚', '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊'
  };

  return text
    .toLowerCase()
    .split('')
    .map((char) => brailleMap[char] || char)
    .join('');
}
