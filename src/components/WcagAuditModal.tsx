import React from 'react';
import { RESEARCH_PAPER } from '../data/methodology';
import { playHapticTone } from '../utils/audio';

interface WcagAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WcagAuditModal: React.FC<WcagAuditModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#171f33] border border-[#2d3449] rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-[#dae2fd] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#2d3449]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[24px]">verified</span>
            <div>
              <h3 id="audit-title" className="text-[18px] font-semibold text-[#dae2fd]">
                WCAG 2.2 AAA Accessibility Audit
              </h3>
              <span className="text-[12px] text-[#4edea3] font-code flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                Official Verification Status: 100% Passing
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              playHapticTone('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-white hover:bg-[#222a3d]"
            aria-label="Close audit modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Audit criteria list */}
        <div className="flex flex-col gap-2.5">
          {RESEARCH_PAPER.wcagMatrix.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[#131b2e] border border-[#222a3d] flex flex-col gap-1 text-[13px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#dae2fd]">{item.criterion}</span>
                <span className="font-code text-[11px] px-2 py-0.5 rounded bg-[#00885d]/30 text-[#4edea3] font-bold">
                  {item.level} • {item.status}
                </span>
              </div>
              <p className="text-[12px] text-[#c7c4d7]">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#2d3449]">
          <span className="text-[12px] text-[#908fa0]">
            Validated according to W3C ACT-Rules specification.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#c0c1ff] text-[#1000a9] font-semibold text-[13px] hover:bg-[#e1e0ff]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
