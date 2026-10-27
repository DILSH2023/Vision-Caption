import React, { useState, useEffect, useRef } from 'react';
import { SampleData, WorkbenchMode, AccessibilitySettings } from '../types';
import { playHapticTone, SpeechController } from '../utils/audio';

interface LiveDemoProps {
  samples: SampleData[];
  currentSampleIdx: number;
  onSelectSampleIdx: (idx: number) => void;
  workbenchMode: WorkbenchMode;
  onChangeWorkbenchMode: (mode: WorkbenchMode) => void;
  onOpenUpload: () => void;
  onOpenLiveCam: () => void;
  onOpenPhonetics: () => void;
  onOpenWcagAudit: () => void;
  settings: AccessibilitySettings;
}

export const LiveDemo: React.FC<LiveDemoProps> = ({
  samples,
  currentSampleIdx,
  onSelectSampleIdx,
  workbenchMode,
  onChangeWorkbenchMode,
  onOpenUpload,
  onOpenLiveCam,
  onOpenPhonetics,
  onOpenWcagAudit,
  settings,
}) => {
  const sample = samples[currentSampleIdx] || samples[0];

  const [currentLang, setCurrentLang] = useState<string>('en');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [heatmapActive, setHeatmapActive] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(settings.speechRate || 1.0);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [copiedAlt, setCopiedAlt] = useState<boolean>(false);
  const [copiedBraille, setCopiedBraille] = useState<boolean>(false);
  const [isZeroShot, setIsZeroShot] = useState<boolean>(false);

  // Dynamic focus coordinate on canvas (defaults to sample, but interactive on click)
  const [activeFocus, setActiveFocus] = useState(sample.focusCoord);
  const [activeBbox, setActiveBbox] = useState(sample.secondaryBbox);
  const [coordLabel, setCoordLabel] = useState(`X: ${sample.coordPixels.x}px Y: ${sample.coordPixels.y}px`);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number | null>(null);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Update focus when sample changes
  useEffect(() => {
    setActiveFocus(sample.focusCoord);
    setActiveBbox(sample.secondaryBbox);
    setCoordLabel(`X: ${sample.coordPixels.x}px Y: ${sample.coordPixels.y}px`);
    setSelectedTokenIdx(null);

    // If audio is playing when sample changes, speak the new caption
    if (isPlayingAudio) {
      speakCurrentCaption();
    }
  }, [currentSampleIdx, sample]);

  // Keep playback rate synced with settings if updated from settings modal
  useEffect(() => {
    if (settings.speechRate) {
      setPlaybackRate(settings.speechRate);
    }
  }, [settings.speechRate]);

  const speakCurrentCaption = () => {
    const textToSpeak = sample.translations[currentLang] || sample.sota;
    const speech = SpeechController.getInstance();

    setIsPlayingAudio(true);
    speech.speak(
      textToSpeak,
      currentLang,
      playbackRate,
      settings.speechPitch || 1.0,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const toggleAudioSpeech = () => {
    playHapticTone('tap');
    const speech = SpeechController.getInstance();
    if (isPlayingAudio) {
      speech.stop();
      setIsPlayingAudio(false);
    } else {
      speakCurrentCaption();
    }
  };

  const handleSelectLanguage = (lang: string) => {
    playHapticTone('tap');
    setCurrentLang(lang);
    if (isPlayingAudio) {
      const speech = SpeechController.getInstance();
      speech.stop();
      setTimeout(() => {
        const textToSpeak = sample.translations[lang] || sample.sota;
        speech.speak(textToSpeak, lang, playbackRate, settings.speechPitch || 1.0, undefined, () =>
          setIsPlayingAudio(false)
        );
      }, 50);
    }
  };

  const handleSpeedChange = (rate: number) => {
    playHapticTone('tap');
    setPlaybackRate(rate);
    if (isPlayingAudio) {
      // Re-trigger with new rate seamlessly
      const speech = SpeechController.getInstance();
      speech.stop();
      speakCurrentCaption();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = Math.round((clickX / rect.width) * 100);
    const pctY = Math.round((clickY / rect.height) * 100);

    const pixelX = Math.round((clickX / rect.width) * 640);
    const pixelY = Math.round((clickY / rect.height) * 480);

    playHapticTone('tap');
    setActiveFocus({
      top: `${pctY}%`,
      left: `${pctX}%`,
      label: `focus: ${(0.85 + (pctX % 15) * 0.01).toFixed(2)}`,
      alpha: `α_head: ${(0.88 + (pctY % 12) * 0.01).toFixed(2)}`,
    });
    setCoordLabel(`X: ${pixelX}px Y: ${pixelY}px`);
  };

  const handleTokenClick = (idx: number) => {
    playHapticTone('tap');
    setSelectedTokenIdx(idx);
    const token = sample.tokens[idx];
    if (token) {
      if (token.focusCoord) {
        setActiveFocus(token.focusCoord);
      }
      if (token.bbox) {
        setActiveBbox({ ...token.bbox, label: `${token.word}: ${token.conf}` });
      }
      // Speak the selected token
      const speech = SpeechController.getInstance();
      speech.speak(token.word, 'en', 1.0, 1.1);
    }
  };

  const copyTranslatedText = () => {
    const text = sample.translations[currentLang] || sample.sota;
    navigator.clipboard?.writeText(text);
    playHapticTone('success');
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const copyAltText = () => {
    const text = `alt="${sample.sota}"`;
    navigator.clipboard?.writeText(text);
    playHapticTone('success');
    setCopiedAlt(true);
    setTimeout(() => setCopiedAlt(false), 2000);
  };

  const copyBrailleBuffer = () => {
    navigator.clipboard?.writeText(sample.braille);
    playHapticTone('success');
    setCopiedBraille(true);
    setTimeout(() => setCopiedBraille(false), 2000);
  };

  const langTitles: Record<string, string> = {
    en: 'English Direct Render',
    es: 'Traducción al Español',
    fr: 'Traduction en Français',
    hi: 'हिन्दी अनुवाद',
    ja: '日本語翻訳',
    ar: 'الترجمة العربية',
  };

  const metricsData = isZeroShot ? sample.zeroShotMetrics : {
    baseline: sample.baselineMetrics,
    sota: sample.sotaMetrics,
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-4 gap-6">
      {/* Mode Selector Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-code text-[11px] font-semibold text-[#4cd7f6] tracking-widest uppercase">
            Evaluation Workbench
          </span>
          <button
            onClick={() => {
              playHapticTone('tap');
              onOpenWcagAudit();
            }}
            title="Inspect WCAG 2.2 AAA Accessibility Audit"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00885d]/30 text-[#4edea3] hover:bg-[#00885d]/50 font-code text-[12px] font-medium transition-colors cursor-pointer border border-[#00885d]/40"
          >
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
            WCAG AAA Compliant
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>
        </div>

        {/* Pill Segmented Control */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-[#131b2e] border border-[#222a3d] shadow-sm">
          <button
            onClick={() => {
              playHapticTone('tap');
              onChangeWorkbenchMode('a11y');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-[15px] font-semibold transition-all shadow-sm ${
              workbenchMode === 'a11y'
                ? 'bg-[#c0c1ff] text-[#1000a9]'
                : 'text-[#c7c4d7] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">hearing</span>
            <span>Assistive Audio</span>
          </button>
          <button
            onClick={() => {
              playHapticTone('tap');
              onChangeWorkbenchMode('research');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-[15px] font-semibold transition-all shadow-sm ${
              workbenchMode === 'research'
                ? 'bg-[#4cd7f6] text-[#003640]'
                : 'text-[#c7c4d7] hover:text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">biotech</span>
            <span>Research Matrix</span>
          </button>
        </div>
      </div>

      {/* Image Selector & Presets */}
      <div className="flex flex-col gap-2.5 bg-[#171f33] rounded-xl p-4 border border-[#222a3d] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">collections</span>
            <h2 className="text-[17px] font-semibold text-[#dae2fd]">Test Bench Dataset (Flickr8k)</h2>
          </div>
          <span className="font-code text-[12px] text-[#c7c4d7]">
            {samples.length} Samples Loaded
          </span>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {samples.slice(0, 3).map((item, idx) => {
            const isSelected = idx === currentSampleIdx;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playHapticTone('tap');
                  onSelectSampleIdx(idx);
                }}
                className={`flex flex-col rounded-lg overflow-hidden transition-all outline-none p-1 text-left ${
                  isSelected
                    ? 'bg-[#31394d] ring-2 ring-[#c0c1ff] shadow-md'
                    : 'bg-[#222a3d] hover:bg-[#2d3449] opacity-80 hover:opacity-100'
                }`}
              >
                <div className="relative w-full aspect-video rounded overflow-hidden bg-black/40">
                  <img
                    className="w-full h-full object-cover"
                    src={item.thumbUrl}
                    alt={item.title}
                  />
                  <span
                    className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded font-code text-[11px] font-bold ${
                      isSelected
                        ? 'bg-[#060e20]/90 text-[#4edea3]'
                        : 'bg-[#060e20]/80 text-[#c7c4d7]'
                    }`}
                  >
                    {item.code}
                  </span>
                </div>
                <span
                  className={`font-code text-[11px] font-semibold text-center mt-1 truncate px-1 block ${
                    isSelected ? 'text-[#dae2fd]' : 'text-[#c7c4d7]'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Actions / Custom Upload */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              playHapticTone('tap');
              onOpenUpload();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] text-[13px] font-medium transition-colors border border-[#2d3449]"
          >
            <span className="material-symbols-outlined text-[18px] text-[#c0c1ff]">upload_file</span>
            <span>Upload File</span>
          </button>
          <button
            onClick={() => {
              playHapticTone('tap');
              onOpenLiveCam();
            }}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] text-[13px] font-medium transition-colors border border-[#2d3449]"
          >
            <span className="material-symbols-outlined text-[18px] text-[#4cd7f6]">photo_camera</span>
            <span>Live Cam</span>
          </button>
          <button
            onClick={() => {
              playHapticTone('tap');
              setHeatmapActive(!heatmapActive);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[13px] font-medium transition-colors border ${
              heatmapActive
                ? 'bg-[#00885d]/40 text-[#4edea3] border-[#4edea3]'
                : 'bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] border-[#2d3449]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-[#4edea3]">blur_on</span>
            <span>{heatmapActive ? 'Heatmap ON' : 'Attention'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Active Canvas View */}
      <div className="relative rounded-xl overflow-hidden bg-[#060e20] shadow-xl border border-[#222a3d] flex flex-col">
        <div
          ref={canvasContainerRef}
          onClick={handleCanvasClick}
          className="relative w-full aspect-[16/10] overflow-hidden flex items-center justify-center cursor-crosshair select-none"
        >
          <img
            className="w-full h-full object-cover pointer-events-none transition-all duration-300"
            src={sample.imgUrl}
            alt={sample.dataAlt}
          />

          {/* Attention Overlay Gradient / Map Layer */}
          <div
            className={`absolute inset-0 bg-gradient-to-tr from-[#4cd7f6]/40 via-[#4edea3]/25 to-[#c0c1ff]/45 transition-opacity duration-300 pointer-events-none mix-blend-screen ${
              heatmapActive ? 'opacity-90' : 'opacity-0'
            }`}
          />

          {/* Attention Focus Coordinate Dots */}
          <div
            style={{ top: activeFocus.top, left: activeFocus.left }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-all duration-300"
          >
            <span className="w-8 h-8 rounded-full bg-[#4cd7f6]/40 animate-ping absolute"></span>
            <span className="w-4 h-4 rounded-full bg-[#4cd7f6] flex items-center justify-center shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#003640]"></span>
            </span>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#060e20]/90 font-code text-[11px] text-[#4cd7f6] whitespace-nowrap shadow-sm border border-[#4cd7f6]/30">
              {activeFocus.alpha}
            </div>
          </div>

          {/* Secondary Focus Bounding Box */}
          <div
            style={{
              top: activeBbox.top,
              left: activeBbox.left,
              width: activeBbox.width,
              height: activeBbox.height,
            }}
            className="absolute rounded border border-dashed border-[#c0c1ff] bg-[#c0c1ff]/15 transition-all pointer-events-none flex items-start justify-end p-1 shadow-sm"
          >
            <span className="font-code text-[11px] text-[#c0c1ff] bg-[#060e20]/90 px-1 rounded border border-[#c0c1ff]/30">
              {activeBbox.label}
            </span>
          </div>

          {/* Live Zoom / Resolution Pill */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#060e20]/90 text-[#dae2fd] font-code text-[12px] border border-[#2d3449]">
            <span className="material-symbols-outlined text-[14px] text-[#4edea3]">center_focus_strong</span>
            <span>{coordLabel}</span>
          </div>

          {/* Tip */}
          <div className="absolute bottom-2.5 right-2.5 hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-[#060e20]/80 text-[#c7c4d7] font-code text-[10px]">
            <span>Click image to probe gaze</span>
          </div>
        </div>
      </div>

      {/* Accessible Audio Controller Component */}
      <div className="flex flex-col gap-2.5 bg-[#131b2e] rounded-xl p-4 border border-[#222a3d] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c0c1ff] text-[22px]">volume_up</span>
            <h2 className="text-[17px] font-semibold text-[#dae2fd]">
              Screen Reader &amp; Spoken Caption
            </h2>
          </div>
          <span
            className={`font-code text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
              isPlayingAudio
                ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] animate-pulse'
                : 'bg-[#00885d]/30 text-[#4edea3]'
            }`}
          >
            {isPlayingAudio ? 'Vocalizing...' : 'Ready'}
          </span>
        </div>

        {/* Master TTS Playback Bar */}
        <div className="flex items-center gap-3 bg-[#171f33] rounded-lg p-2.5 border border-[#222a3d]">
          <button
            onClick={toggleAudioSpeech}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[15px] transition-all shadow-md active:scale-95 ${
              isPlayingAudio
                ? 'bg-[#4cd7f6] text-[#003640] shadow-[0_0_15px_rgba(76,215,246,0.5)]'
                : 'bg-[#c0c1ff] text-[#1000a9] hover:bg-[#e1e0ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isPlayingAudio ? 'stop' : 'play_arrow'}
            </span>
            <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Caption'}</span>
          </button>

          {/* Simulated Waveform Bars */}
          <div className="flex-1 flex items-center justify-center gap-1 h-8 px-2 overflow-hidden">
            {[2, 4, 6, 3, 7, 5, 2, 4].map((h, i) => (
              <span
                key={i}
                style={{
                  height: isPlayingAudio ? `${Math.max(6, (h * 4) + ((i * 3) % 10))}px` : `${h * 3}px`,
                }}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isPlayingAudio
                    ? i % 2 === 0
                      ? 'bg-[#4cd7f6] animate-pulse'
                      : 'bg-[#c0c1ff]'
                    : 'bg-[#2d3449]'
                }`}
              />
            ))}
          </div>

          {/* Speed Control Segmented */}
          <div className="flex items-center bg-[#222a3d] rounded-full p-0.5 border border-[#2d3449]">
            {[0.75, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSpeedChange(rate)}
                className={`px-2.5 py-1 rounded-full font-code text-[11px] transition-all ${
                  playbackRate === rate
                    ? 'bg-[#31394d] text-[#dae2fd] font-bold shadow-sm'
                    : 'text-[#c7c4d7] hover:text-[#dae2fd]'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Multilingual Translation Selector */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-code text-[11px] font-semibold text-[#c7c4d7] uppercase tracking-wider">
              Multilingual Vocalizer
            </span>
            <button
              onClick={() => {
                playHapticTone('tap');
                onOpenPhonetics();
              }}
              className="flex items-center gap-1 font-code text-[11px] text-[#4cd7f6] hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
              Phonetics
            </button>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {[
              { code: 'en', label: 'EN', sub: 'Eng' },
              { code: 'es', label: 'ES', sub: 'Esp' },
              { code: 'fr', label: 'FR', sub: 'Fra' },
              { code: 'hi', label: 'HI', sub: 'हिन्दी' },
              { code: 'ja', label: 'JA', sub: '日本語' },
              { code: 'ar', label: 'AR', sub: 'عربي' },
            ].map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`flex flex-col items-center py-1.5 px-1 rounded transition-all ${
                    isSelected
                      ? 'bg-[#c0c1ff] text-[#1000a9] font-bold shadow-sm'
                      : 'bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd]'
                  }`}
                >
                  <span className="text-[14px] font-semibold">{lang.label}</span>
                  <span className="font-code text-[10px] opacity-80">{lang.sub}</span>
                </button>
              );
            })}
          </div>

          {/* Live Translated Output Pill Card */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#222a3d] mt-1 border border-[#2d3449]">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="font-code text-[11px] text-[#c7c4d7]">
                {langTitles[currentLang] || 'Rendered Vocalization'}
              </span>
              <p className="text-[14px] text-[#dae2fd] font-semibold truncate mt-0.5">
                {sample.translations[currentLang] || sample.sota}
              </p>
            </div>
            <button
              onClick={copyTranslatedText}
              className="p-2 rounded bg-[#31394d] text-[#dae2fd] hover:text-[#c0c1ff] transition-colors flex-shrink-0"
              title="Copy translated caption"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copiedCaption ? 'check' : 'content_copy'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Model Comparison Dual Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#dae2fd]">Multimodal Model Inference</h2>
          <button
            onClick={() => {
              playHapticTone('tap');
              setIsZeroShot(!isZeroShot);
            }}
            className="font-code text-[12px] text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isZeroShot ? 'Evaluation: Zero-Shot (COCO)' : 'Evaluation: Supervised (Flickr)'}</span>
            <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
          </button>
        </div>

        {/* Card A: Baseline ResNet-LSTM */}
        <div className="flex flex-col rounded-xl bg-[#171f33] p-4 shadow-sm gap-2.5 relative overflow-hidden border border-[#222a3d]">
          <div className="w-1.5 absolute top-0 bottom-0 left-0 bg-[#4edea3]"></div>
          <div className="flex items-start justify-between pl-2">
            <div className="flex flex-col">
              <span className="font-code text-[11px] font-semibold text-[#4edea3] uppercase tracking-wider">
                Baseline Architecture
              </span>
              <h3 className="text-[16px] font-semibold text-[#dae2fd]">
                ResNet50 + LSTM (Bahdanau Attention)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[#c7c4d7] font-code text-[12px]">
              {metricsData.baseline.latencyMs}ms
            </span>
          </div>

          <div className="pl-2">
            <p className="text-[14px] text-[#dae2fd] bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] italic">
              "{sample.baseline}"
            </p>
          </div>

          {/* Baseline Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 pl-2 pt-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#222a3d] font-code text-[12px] text-[#dae2fd]">
              <span className="text-[#c7c4d7]">BLEU-4</span>
              <span className="font-bold text-[#4edea3]">{metricsData.baseline.bleu4}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#222a3d] font-code text-[12px] text-[#dae2fd]">
              <span className="text-[#c7c4d7]">CIDEr</span>
              <span className="font-bold text-[#4edea3]">{metricsData.baseline.cider}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#222a3d] font-code text-[12px] text-[#dae2fd]">
              <span className="text-[#c7c4d7]">METEOR</span>
              <span className="font-bold">{metricsData.baseline.meteor}</span>
            </div>
          </div>
        </div>

        {/* Card B: SOTA BLIP */}
        <div className="flex flex-col rounded-xl bg-[#171f33] p-4 shadow-sm gap-2.5 relative overflow-hidden border border-[#222a3d]">
          <div className="w-1.5 absolute top-0 bottom-0 left-0 bg-[#4cd7f6]"></div>
          <div className="flex items-start justify-between pl-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-code text-[11px] font-semibold text-[#4cd7f6] uppercase tracking-wider">
                  Transformer Vision-Language
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#03b5d3]/30 text-[#4cd7f6] font-code text-[11px] font-bold">
                  Recommended
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-[#dae2fd]">
                BLIP (Bootstrapping Image-Text Pretraining)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[#c7c4d7] font-code text-[12px]">
              {metricsData.sota.latencyMs}ms
            </span>
          </div>

          <div className="pl-2">
            <p className="text-[14px] text-[#dae2fd] bg-[#131b2e] p-3 rounded-lg font-medium border border-[#222a3d]">
              "{sample.sota}"
            </p>
          </div>

          {/* SOTA Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 pl-2 pt-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00885d]/30 font-code text-[12px] text-[#4edea3]">
              <span>BLEU-4</span>
              <span className="font-bold">{metricsData.sota.bleu4}</span>
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#03b5d3]/30 font-code text-[12px] text-[#4cd7f6]">
              <span>CIDEr</span>
              <span className="font-bold">{metricsData.sota.cider}</span>
              <span className="material-symbols-outlined text-[14px]">verified</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#222a3d] font-code text-[12px] text-[#dae2fd]">
              <span className="text-[#c7c4d7]">SPICE</span>
              <span className="font-bold text-[#c0c1ff]">{metricsData.sota.spice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Vocabulary Confidence Breakdown */}
      <div className="flex flex-col gap-2 bg-[#171f33] rounded-xl p-4 border border-[#222a3d] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c0c1ff] text-[20px]">insights</span>
            <h2 className="text-[17px] font-semibold text-[#dae2fd]">Token Confidence &amp; Attention Log-Prob</h2>
          </div>
          <span className="font-code text-[12px] text-[#c7c4d7]">Softmax Probabilities</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {sample.tokens.map((token, idx) => {
            const isSelected = selectedTokenIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => handleTokenClick(idx)}
                title={`Click to highlight "${token.word}" in visual field`}
                className={`px-2.5 py-1 rounded-full font-code text-[12px] flex items-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-[#c0c1ff] text-[#1000a9] ring-2 ring-[#c0c1ff] font-bold shadow-md'
                    : 'bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd]'
                }`}
              >
                <span>{token.word}</span>
                <span
                  className={
                    isSelected
                      ? 'text-[#1000a9] font-bold'
                      : parseInt(token.conf) >= 90
                      ? 'text-[#4edea3] font-bold'
                      : 'text-[#c0c1ff] font-bold'
                  }
                >
                  {token.conf}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Reader Accessible Braille Preview & Alt-Text Payload */}
      <div className="flex flex-col gap-2.5 bg-[#131b2e] rounded-xl p-4 border border-[#222a3d] shadow-sm mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">blind</span>
            <h2 className="text-[17px] font-semibold text-[#dae2fd]">Accessibility Export Payload</h2>
          </div>
          <button
            onClick={() => {
              playHapticTone('pulse');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#222a3d] font-code text-[12px] text-[#dae2fd] hover:bg-[#31394d] transition-colors border border-[#2d3449]"
          >
            <span className="material-symbols-outlined text-[16px] text-[#4edea3]">vibration</span>
            <span>Haptic Pulse</span>
          </button>
        </div>

        {/* Braille Unicode Representation */}
        <div className="flex flex-col gap-1 bg-[#060e20] p-3 rounded-lg border border-[#222a3d]">
          <div className="flex items-center justify-between text-[#c7c4d7] font-code text-[11px]">
            <span>Grade 2 Refreshable Braille Buffer</span>
            <button
              onClick={copyBrailleBuffer}
              className="font-code text-[11px] text-[#4cd7f6] hover:underline flex items-center gap-0.5"
            >
              <span>{copiedBraille ? 'Copied' : 'Copy Braille'}</span>
              <span className="material-symbols-outlined text-[12px]">content_copy</span>
            </button>
          </div>
          <div className="font-code text-[15px] text-[#c0c1ff] tracking-widest overflow-x-auto py-1">
            {sample.braille}
          </div>
        </div>

        {/* Quick Copy Alt-Text Action */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#171f33] border border-[#222a3d]">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="font-code text-[11px] text-[#c7c4d7]">Validated HTML Alt-Attribute</span>
            <code className="font-code text-[12px] text-[#4edea3] truncate mt-0.5">
              alt="{sample.sota}"
            </code>
          </div>
          <button
            onClick={copyAltText}
            className="px-3 py-1.5 rounded bg-[#c0c1ff] text-[#1000a9] font-semibold text-[13px] transition-all flex items-center gap-1 active:scale-95 shadow-sm hover:bg-[#e1e0ff]"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copiedAlt ? 'check' : 'done'}
            </span>
            <span>{copiedAlt ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
