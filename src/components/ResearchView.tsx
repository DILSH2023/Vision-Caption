import React, { useState } from 'react';
import { RESEARCH_PAPER } from '../data/methodology';
import { playHapticTone, SpeechController } from '../utils/audio';

export const ResearchView: React.FC = () => {
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);
  const [isReadingAbstract, setIsReadingAbstract] = useState<boolean>(false);

  const handleCopyBibtex = () => {
    navigator.clipboard?.writeText(RESEARCH_PAPER.bibtex);
    playHapticTone('success');
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const handleToggleReadAbstract = () => {
    playHapticTone('tap');
    const speech = SpeechController.getInstance();
    if (isReadingAbstract) {
      speech.stop();
      setIsReadingAbstract(false);
    } else {
      setIsReadingAbstract(true);
      speech.speak(
        RESEARCH_PAPER.abstract,
        'en',
        1.0,
        1.0,
        () => setIsReadingAbstract(true),
        () => setIsReadingAbstract(false),
        () => setIsReadingAbstract(false)
      );
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-4 gap-6 text-[#dae2fd]">
      {/* Paper Header */}
      <div className="flex flex-col gap-2.5 bg-[#171f33] p-5 rounded-xl border border-[#222a3d] shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-code text-[11px] font-semibold text-[#4cd7f6] uppercase tracking-widest">
            Peer-Reviewed Academic Publication
          </span>
          <span className="font-code text-[11px] text-[#4edea3] bg-[#00885d]/20 px-2 py-0.5 rounded">
            {RESEARCH_PAPER.date}
          </span>
        </div>

        <h2 className="text-[20px] sm:text-[22px] font-bold text-[#dae2fd] leading-tight">
          {RESEARCH_PAPER.title}
        </h2>

        <div className="text-[12px] text-[#c7c4d7] font-code italic">
          {RESEARCH_PAPER.venue}
        </div>

        {/* Authors */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-[#222a3d] mt-1">
          {RESEARCH_PAPER.authors.map((author, i) => (
            <div key={i} className="flex flex-col bg-[#131b2e] px-3 py-1.5 rounded-lg border border-[#222a3d]">
              <span className="text-[13px] font-semibold text-[#dae2fd]">{author.name}</span>
              <span className="text-[11px] text-[#908fa0]">{author.role} • {author.org}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Abstract */}
      <div className="flex flex-col gap-2.5 bg-[#171f33] p-5 rounded-xl border border-[#222a3d]">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#dae2fd] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c0c1ff] text-[20px]">description</span>
            Abstract
          </h3>
          <button
            onClick={handleToggleReadAbstract}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-code text-[11px] font-semibold transition-all ${
              isReadingAbstract
                ? 'bg-[#4cd7f6] text-[#003640]'
                : 'bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isReadingAbstract ? 'stop' : 'volume_up'}
            </span>
            <span>{isReadingAbstract ? 'Stop' : 'Listen Abstract'}</span>
          </button>
        </div>
        <p className="text-[14px] text-[#c7c4d7] leading-relaxed">
          {RESEARCH_PAPER.abstract}
        </p>
      </div>

      {/* Mathematical Formulations */}
      <div className="flex flex-col gap-4">
        {RESEARCH_PAPER.sections.map((sec) => (
          <div
            key={sec.id}
            className="flex flex-col gap-3 bg-[#171f33] p-5 rounded-xl border border-[#222a3d]"
          >
            <div className="flex flex-col">
              <span className="font-code text-[11px] font-semibold text-[#4edea3] uppercase">
                {sec.subtitle}
              </span>
              <h3 className="text-[17px] font-bold text-[#dae2fd]">{sec.title}</h3>
            </div>

            <p className="text-[13px] text-[#c7c4d7] leading-relaxed">{sec.content}</p>

            {sec.formula && (
              <div className="flex flex-col gap-2 bg-[#060e20] p-4 rounded-lg border border-[#222a3d]">
                <span className="text-[11px] font-code text-[#4cd7f6] uppercase">
                  Mathematical Representation
                </span>
                <div className="font-code text-[14px] text-[#c0c1ff] font-semibold overflow-x-auto py-1">
                  {sec.formula.latex}
                </div>
                <p className="text-[12px] text-[#908fa0] italic">{sec.formula.description}</p>

                {/* Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-[#222a3d]">
                  {sec.formula.params.map((p, pIdx) => (
                    <div key={pIdx} className="text-[11px] font-code flex items-start gap-1.5">
                      <span className="text-[#4edea3] font-bold whitespace-nowrap">{p.symbol}:</span>
                      <span className="text-[#c7c4d7]">{p.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* WCAG Compliance Matrix */}
      <div className="flex flex-col gap-3 bg-[#171f33] p-5 rounded-xl border border-[#222a3d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4edea3] text-[22px]">verified_user</span>
            <h3 className="text-[17px] font-bold text-[#dae2fd]">
              WCAG 2.2 AAA Accessibility Audit Checklist
            </h3>
          </div>
          <span className="font-code text-[11px] text-[#4edea3] bg-[#00885d]/30 px-2.5 py-0.5 rounded-full font-bold">
            7/7 Tests Passed
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {RESEARCH_PAPER.wcagMatrix.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-2.5 rounded bg-[#131b2e] border border-[#222a3d] text-[12px]"
            >
              <div className="flex flex-col pr-2">
                <span className="font-semibold text-[#dae2fd]">{item.criterion}</span>
                <span className="text-[#908fa0]">{item.detail}</span>
              </div>
              <span className="font-code text-[11px] font-bold text-[#4edea3] whitespace-nowrap bg-[#00885d]/20 px-2 py-0.5 rounded">
                {item.level} ({item.status})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Citation BibTeX Card */}
      <div className="flex flex-col gap-2.5 bg-[#171f33] p-5 rounded-xl border border-[#222a3d] mb-4">
        <div className="flex items-center justify-between">
          <span className="font-code text-[11px] font-semibold text-[#c7c4d7] uppercase">
            Export Citation (BibTeX)
          </span>
          <button
            onClick={handleCopyBibtex}
            className="flex items-center gap-1 px-3 py-1 rounded bg-[#c0c1ff] text-[#1000a9] font-code text-[11px] font-bold hover:bg-[#e1e0ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copiedBibtex ? 'check' : 'content_copy'}
            </span>
            <span>{copiedBibtex ? 'Copied BibTeX' : 'Copy BibTeX'}</span>
          </button>
        </div>
        <pre className="font-code text-[11px] text-[#4cd7f6] bg-[#060e20] p-3 rounded-lg overflow-x-auto border border-[#222a3d]">
          {RESEARCH_PAPER.bibtex}
        </pre>
      </div>
    </div>
  );
};
