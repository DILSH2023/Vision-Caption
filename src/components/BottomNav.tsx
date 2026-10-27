import React from 'react';
import { ViewTab } from '../types';
import { playHapticTone } from '../utils/audio';

interface BottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: ViewTab; label: string; icon: string; ariaLabel: string }[] = [
    { id: 'live-demo', label: 'Demo', icon: 'auto_awesome', ariaLabel: 'Live Evaluation Demo Screen' },
    { id: 'benchmark-study', label: 'Benchmarks', icon: 'leaderboard', ariaLabel: 'Multimodal Benchmark Study Screen' },
    { id: 'attention-maps', label: 'Heatmaps', icon: 'grid_view', ariaLabel: 'Spatial Attention Maps Screen' },
    { id: 'methodology-dataset', label: 'Research', icon: 'menu_book', ariaLabel: 'Research Methodology and Papers Screen' },
  ];

  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#131b2e]/95 backdrop-blur-xl border-t border-[#222a3d]/80 shadow-[0_-1px_12px_rgba(0,0,0,0.4)]"
    >
      <div className="max-w-4xl mx-auto flex justify-around items-stretch h-16">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHapticTone('tap');
                onSelectTab(tab.id);
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.ariaLabel}
              className={`flex flex-col items-center justify-center flex-1 min-w-[48px] py-1 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#c0c1ff] ${
                isActive
                  ? 'text-[#c0c1ff] border-t-2 border-[#c0c1ff] bg-[#171f33]/70 font-semibold'
                  : 'text-[#c7c4d7] hover:text-[#dae2fd] hover:bg-[#171f33]/30'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] transition-transform ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className="font-code text-[11px] font-medium tracking-wide mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
