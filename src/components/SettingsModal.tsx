import React from 'react';
import { AccessibilitySettings } from '../types';
import { playHapticTone } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: AccessibilitySettings) => void;
  onOpenAudit: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenAudit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#171f33] border border-[#2d3449] rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-[#dae2fd] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#2d3449]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c0c1ff] text-[22px]">tune</span>
            <h3 id="settings-title" className="text-[18px] font-semibold text-[#dae2fd]">
              Accessibility &amp; Audio Preferences
            </h3>
          </div>
          <button
            onClick={() => {
              playHapticTone('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-white hover:bg-[#222a3d]"
            aria-label="Close settings dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* High Contrast Mode Switch */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#131b2e] border border-[#222a3d]">
          <div className="flex flex-col">
            <span className="text-[14px] font-medium text-[#dae2fd]">High Contrast Display</span>
            <span className="text-[12px] text-[#908fa0]">WCAG AAA 7:1 border emphasis</span>
          </div>
          <button
            onClick={() => {
              playHapticTone('tap');
              onUpdateSettings({ ...settings, highContrast: !settings.highContrast });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              settings.highContrast ? 'bg-[#c0c1ff]' : 'bg-[#222a3d]'
            }`}
            role="switch"
            aria-checked={settings.highContrast}
          >
            <span
              className={`w-4 h-4 rounded-full bg-[#1000a9] transition-transform ${
                settings.highContrast ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Speech Rate Slider */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[#131b2e] border border-[#222a3d]">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#dae2fd]">Spoken Rate (Speed)</span>
            <span className="font-code text-[12px] text-[#4cd7f6]">{settings.speechRate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={settings.speechRate}
            onChange={(e) => onUpdateSettings({ ...settings, speechRate: parseFloat(e.target.value) })}
            className="accent-[#4cd7f6] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#908fa0] font-code">
            <span>0.5x (Slow)</span>
            <span>1.0x (Normal)</span>
            <span>2.0x (Fast)</span>
          </div>
        </div>

        {/* Speech Pitch Slider */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[#131b2e] border border-[#222a3d]">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#dae2fd]">Voice Pitch</span>
            <span className="font-code text-[12px] text-[#4edea3]">{settings.speechPitch.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.4"
            step="0.05"
            value={settings.speechPitch}
            onChange={(e) => onUpdateSettings({ ...settings, speechPitch: parseFloat(e.target.value) })}
            className="accent-[#4edea3] cursor-pointer"
          />
        </div>

        {/* Font Size Scaling */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[#131b2e] border border-[#222a3d]">
          <span className="text-[14px] font-medium text-[#dae2fd]">Text &amp; UI Sizing</span>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['standard', 'large', 'xlarge'] as const).map((size) => (
              <button
                key={size}
                onClick={() => {
                  playHapticTone('tap');
                  onUpdateSettings({ ...settings, fontSize: size });
                }}
                className={`py-1.5 px-2 rounded-lg font-code text-[12px] capitalize border transition-all ${
                  settings.fontSize === size
                    ? 'bg-[#c0c1ff] text-[#1000a9] border-[#c0c1ff] font-bold'
                    : 'bg-[#222a3d] text-[#c7c4d7] border-transparent hover:border-[#464554]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Haptics & Feedback */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#131b2e] border border-[#222a3d]">
          <div className="flex flex-col">
            <span className="text-[14px] font-medium text-[#dae2fd]">Tactile Vibration &amp; Audio Pulse</span>
            <span className="text-[12px] text-[#908fa0]">Haptic clicks on tap and copy</span>
          </div>
          <button
            onClick={() => {
              playHapticTone('tap');
              onUpdateSettings({ ...settings, haptics: !settings.haptics });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
              settings.haptics ? 'bg-[#4edea3]' : 'bg-[#222a3d]'
            }`}
            role="switch"
            aria-checked={settings.haptics}
          >
            <span
              className={`w-4 h-4 rounded-full bg-[#003824] transition-transform ${
                settings.haptics ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* WCAG AAA Audit Modal Trigger */}
        <div className="pt-2 border-t border-[#2d3449] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenAudit();
            }}
            className="text-[13px] text-[#4cd7f6] hover:underline flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>View WCAG 2.2 AAA Audit Matrix</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#c0c1ff] text-[#1000a9] font-semibold text-[13px] hover:bg-[#e1e0ff]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
