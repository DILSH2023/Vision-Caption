import React, { useState } from 'react';
import { SampleData } from '../types';
import { textToBraille, playHapticTone } from '../utils/audio';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSampleCreated: (newSample: SampleData) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSampleCreated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (!customTitle) {
        setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput.trim());
      if (!customTitle) {
        setCustomTitle('Custom Image');
      }
    }
  };

  const handleProcessImage = () => {
    if (!previewUrl) return;

    setIsProcessing(true);
    playHapticTone('pulse');

    // Simulate smart multimodal inference pipeline
    setTimeout(() => {
      const title = customTitle || 'Custom Upload';
      const sotaCaption = `A detailed scene depicting ${title.toLowerCase()} in clear focal illumination with balanced compositional framing.`;
      const baselineCaption = `An image containing ${title.toLowerCase()}.`;

      const newSample: SampleData = {
        id: `upload-${Date.now()}`,
        code: `#${Math.floor(4000 + Math.random() * 5000)}`,
        title: title,
        imgUrl: previewUrl,
        thumbUrl: previewUrl,
        dataAlt: sotaCaption,
        baseline: baselineCaption,
        baselineMetrics: {
          bleu4: 23.4,
          cider: 0.70,
          meteor: 0.21,
          latencyMs: 19,
        },
        sota: sotaCaption,
        sotaMetrics: {
          bleu4: 38.8,
          cider: 1.25,
          spice: 0.23,
          latencyMs: 43,
        },
        zeroShotMetrics: {
          baseline: { bleu4: 18.2, cider: 0.52, meteor: 0.17, latencyMs: 20 },
          sota: { bleu4: 33.8, cider: 1.10, spice: 0.21, latencyMs: 45 },
        },
        tokens: [
          { word: 'detailed', conf: '95%', logProb: -0.05, bbox: { top: '20%', left: '20%', width: '60%', height: '60%' }, focusCoord: { top: '40%', left: '50%', label: 'scene: 0.95', alpha: 'α_head: 0.94' } },
          { word: 'scene', conf: '97%', logProb: -0.03, bbox: { top: '15%', left: '15%', width: '70%', height: '70%' }, focusCoord: { top: '45%', left: '50%', label: 'context: 0.97', alpha: 'α_head: 0.96' } },
          { word: 'focal', conf: '92%', logProb: -0.08, bbox: { top: '30%', left: '30%', width: '40%', height: '40%' }, focusCoord: { top: '50%', left: '50%', label: 'focus: 0.92', alpha: 'α_head: 0.91' } },
          { word: 'illumination', conf: '89%', logProb: -0.11, bbox: { top: '10%', left: '10%', width: '80%', height: '30%' }, focusCoord: { top: '25%', left: '60%', label: 'lighting: 0.89', alpha: 'α_head: 0.88' } },
          { word: 'composition', conf: '94%', logProb: -0.06, bbox: { top: '25%', left: '25%', width: '50%', height: '50%' }, focusCoord: { top: '52%', left: '48%', label: 'balance: 0.94', alpha: 'α_head: 0.93' } },
        ],
        translations: {
          en: sotaCaption,
          es: `Una escena detallada que representa ${title.toLowerCase()} con iluminación focal clara y encuadre compositivo equilibrado.`,
          fr: `Une scène détaillée représentant ${title.toLowerCase()} avec un éclairage focal net et un cadrage équilibré.`,
          hi: `${title.toLowerCase()} का एक विस्तृत दृश्य, स्पष्ट फोकल रोशनी और संतुलित संरचना के साथ।`,
          ja: `明確な焦点照明とバランスの取れた構図で${title.toLowerCase()}を描いた詳細なシーン。`,
          ar: `مشهد تفصيلي يصور ${title.toLowerCase()} بإضاءة بؤرية واضحة وتأطير تركيبي متوازن.`,
          de: `Eine detaillierte Szene, die ${title.toLowerCase()} in klarer fokaler Beleuchtung mit ausgewogener Komposition darstellt.`,
          zh: `一个详细的场景，描绘了光线清晰、构图平衡的${title.toLowerCase()}。`,
        },
        phonetics: title.toUpperCase().split('').join('-'),
        phoneticsDetail: {
          ipa: `/${title.toLowerCase()}/`,
          arpabet: title.toUpperCase(),
          syllables: [title],
        },
        braille: textToBraille(sotaCaption.slice(0, 36)),
        focusCoord: { top: '45%', left: '50%', label: `${title.toLowerCase()}: 0.96`, alpha: 'α_head: 0.95' },
        secondaryBbox: { top: '30%', left: '30%', width: '40%', height: '40%', label: 'object: 0.96' },
        coordPixels: { x: 480, y: 320 },
      };

      setIsProcessing(false);
      playHapticTone('success');
      onSampleCreated(newSample);
      onClose();
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#171f33] border border-[#2d3449] rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-[#dae2fd]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#2d3449]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c0c1ff] text-[22px]">upload_file</span>
            <h3 id="upload-title" className="text-[18px] font-semibold text-[#dae2fd]">
              Upload Custom Image
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-white hover:bg-[#222a3d]"
            aria-label="Close upload dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* File Dropzone Area */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#464554] hover:border-[#c0c1ff] bg-[#131b2e] hover:bg-[#1a233b] rounded-xl p-6 cursor-pointer transition-colors text-center">
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          {previewUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img src={previewUrl} alt="Upload preview" className="max-h-40 object-cover rounded-lg shadow-md" />
              <span className="text-[12px] text-[#4edea3] font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Image selected: {selectedFile?.name || 'Custom URL'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[#c0c1ff] text-[40px]">add_photo_alternate</span>
              <span className="text-[14px] font-medium text-[#dae2fd]">Click or drag &amp; drop image here</span>
              <span className="text-[12px] text-[#908fa0]">Supports PNG, JPG, WebP, AVIF up to 10MB</span>
            </div>
          )}
        </label>

        {/* Or enter Image URL */}
        <div className="flex flex-col gap-1.5">
          <span className="font-code text-[11px] text-[#c7c4d7] uppercase tracking-wider">
            Or Paste Online Image URL
          </span>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-[#131b2e] border border-[#2d3449] focus:border-[#c0c1ff] rounded-lg px-3 py-2 text-[13px] text-[#dae2fd] outline-none"
            />
            <button
              onClick={handleUrlSubmit}
              className="px-3 py-2 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[13px] text-[#dae2fd]"
            >
              Load
            </button>
          </div>
        </div>

        {/* Optional Title */}
        <div className="flex flex-col gap-1.5">
          <span className="font-code text-[11px] text-[#c7c4d7] uppercase tracking-wider">
            Sample Label / Title
          </span>
          <input
            type="text"
            placeholder="e.g. Cat on Bookshelf"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full bg-[#131b2e] border border-[#2d3449] focus:border-[#c0c1ff] rounded-lg px-3 py-2 text-[13px] text-[#dae2fd] outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2d3449]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] text-[14px]"
          >
            Cancel
          </button>
          <button
            disabled={!previewUrl || isProcessing}
            onClick={handleProcessImage}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-[14px] transition-all ${
              !previewUrl || isProcessing
                ? 'bg-[#222a3d] text-[#908fa0] cursor-not-allowed'
                : 'bg-[#c0c1ff] text-[#1000a9] hover:bg-[#e1e0ff] active:scale-95 shadow-md'
            }`}
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Generating Saliency...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                <span>Run Inference</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
