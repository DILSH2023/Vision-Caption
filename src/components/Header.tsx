import React from 'react';
import { ViewTab } from '../types';
import { playHapticTone } from '../utils/audio';

interface HeaderProps {
  currentTab: ViewTab;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  isSpeaking: boolean;
  onToggleGlobalTts: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  highContrast,
  onToggleHighContrast,
  isSpeaking,
  onToggleGlobalTts,
  onOpenSettings,
}) => {
  const titles: Record<ViewTab, string> = {
    'live-demo': 'Live Demo',
    'benchmark-study': 'Benchmark Study',
    'attention-maps': 'Attention Heatmaps',
    'methodology-dataset': 'Research & Papers',
  };

  const currentTitle = titles[currentTab] || 'Live Demo';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#131b2e]/90 backdrop-blur-xl border-b border-[#222a3d]/60 shadow-[0_1px_8px_rgba(0,0,0,0.2)]">
      <div className="h-16 max-w-4xl mx-auto px-4 flex items-center justify-between gap-3">
        {/* Brand and Current Screen Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <img
              alt="VisionCaption Logo"
              className="h-8 w-auto object-contain flex-shrink-0 rounded"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ9FYsUQo0VAebfJDnfToEQ9KgI5M1TVB3R0TxnRhBx2PJe_XHpOdWDiHvx71MtvKrkEcIoLhH8fyw-zMjb9wnH2TM6ki3CrR01dtscO5R_Rw-PypIghTVo2kd_oJvXkSchA9NWw-dvZZC5ODVXhJ0L4tXamfJjvjRFOyUJO_yzXKTyRrd58WYFhF7IIijxNwfmYlZ4f-3X5zDqP3qw1z0U9RFBO_zv2uxgxRtFxDqcfOiso3fkUrH9A"
            />
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4cd7f6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4cd7f6]"></span>
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-code text-[11px] font-semibold text-[#4cd7f6] tracking-widest uppercase leading-none">
              VisionCaption
            </span>
            <h1 className="text-[18px] font-semibold text-[#dae2fd] truncate leading-tight mt-0.5">
              {currentTitle}
            </h1>
          </div>
        </div>

        {/* Global Action Toggles */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Global Read Aloud */}
          <button
            onClick={() => {
              playHapticTone('tap');
              onToggleGlobalTts();
            }}
            aria-label={isSpeaking ? 'Stop vocalizing screen' : 'Read screen aloud (Global TTS)'}
            title={isSpeaking ? 'Stop vocalizing' : 'Vocalize current screen (TTS)'}
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
              isSpeaking
                ? 'bg-[#4cd7f6] text-[#003640] shadow-[0_0_12px_rgba(76,215,246,0.5)]'
                : 'text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#222a3d] active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSpeaking ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={() => {
              playHapticTone('tap');
              onToggleHighContrast();
            }}
            aria-label="Toggle High Contrast Mode (WCAG AAA)"
            title="Toggle High Contrast Mode"
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
              highContrast
                ? 'bg-[#c0c1ff] text-[#1000a9] font-bold shadow-[0_0_12px_rgba(192,193,255,0.5)]'
                : 'text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#222a3d] active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">contrast</span>
          </button>

          {/* Settings / User Accessibility Profile */}
          <button
            onClick={() => {
              playHapticTone('tap');
              onOpenSettings();
            }}
            aria-label="Accessibility & Speech Settings"
            title="Accessibility & Speech Settings"
            className="w-8 h-8 rounded-full bg-[#c0c1ff] hover:bg-[#8083ff] text-[#1000a9] flex items-center justify-center ml-1 flex-shrink-0 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>
      </div>
    </header>
  );
};
