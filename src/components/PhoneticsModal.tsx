import React from 'react';
import { SampleData } from '../types';
import { playHapticTone, SpeechController } from '../utils/audio';

interface PhoneticsModalProps {
  sample: SampleData;
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneticsModal: React.FC<PhoneticsModalProps> = ({ sample, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSpeakPhonetic = () => {
    playHapticTone('pulse');
    const speech = SpeechController.getInstance();
    // Speak word by word slowly
    speech.speak(sample.phoneticsDetail.syllables.join(', '), 'en', 0.8, 1.0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phonetics-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#171f33] border border-[#2d3449] rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-[#dae2fd]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#2d3449]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[22px]">record_voice_over</span>
            <h3 id="phonetics-title" className="text-[18px] font-semibold text-[#dae2fd]">
              Phonetic &amp; Acoustic Vocalization
            </h3>
          </div>
          <button
            onClick={() => {
              playHapticTone('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-white hover:bg-[#222a3d]"
            aria-label="Close Phonetics dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Target Caption */}
          <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d]">
            <span className="font-code text-[11px] text-[#c7c4d7] uppercase tracking-wider block mb-1">
              Natural Language Text
            </span>
            <p className="text-[14px] font-medium text-[#dae2fd]">{sample.sota}</p>
          </div>

          {/* IPA (International Phonetic Alphabet) */}
          <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d]">
            <span className="font-code text-[11px] text-[#4edea3] uppercase tracking-wider block mb-1">
              IPA (International Phonetic Alphabet)
            </span>
            <div className="font-code text-[14px] text-[#4edea3] font-semibold tracking-wide bg-[#060e20] p-2 rounded">
              {sample.phoneticsDetail.ipa}
            </div>
          </div>

          {/* ARPAbet Machine Speech Symbols */}
          <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d]">
            <span className="font-code text-[11px] text-[#4cd7f6] uppercase tracking-wider block mb-1">
              ARPAbet Acoustic Token Units (CMU Dict)
            </span>
            <div className="font-code text-[12px] text-[#4cd7f6] tracking-wider bg-[#060e20] p-2 rounded overflow-x-auto">
              {sample.phoneticsDetail.arpabet}
            </div>
          </div>

          {/* Syllable Decomposition */}
          <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d]">
            <span className="font-code text-[11px] text-[#c0c1ff] uppercase tracking-wider block mb-1">
              Syllabic Decomposition &amp; Pacing
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sample.phoneticsDetail.syllables.map((syl, i) => (
                <span
                  key={i}
                  className="font-code text-[12px] px-2.5 py-1 rounded bg-[#222a3d] text-[#c0c1ff] font-medium border border-[#2d3449]"
                >
                  {syl}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2d3449]">
          <button
            onClick={handleSpeakPhonetic}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4cd7f6] text-[#003640] font-semibold text-[14px] hover:bg-[#80e5fb] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">volume_up</span>
            <span>Pronounce Syllables</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] text-[14px] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
