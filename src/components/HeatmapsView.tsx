import React, { useState } from 'react';
import { ATTENTION_HEADS, COLORMAPS } from '../data/heatmaps';
import { SampleData } from '../types';
import { playHapticTone, SpeechController } from '../utils/audio';

interface HeatmapsViewProps {
  currentSample: SampleData;
}

export const HeatmapsView: React.FC<HeatmapsViewProps> = ({ currentSample }) => {
  const [selectedHeadId, setSelectedHeadId] = useState<number>(2); // Default Head 2 (disc/frisbee)
  const [selectedColormap, setSelectedColormap] = useState<string>('cyber');
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.85);
  const [threshold, setThreshold] = useState<number>(0.15);
  const [selectedLayer, setSelectedLayer] = useState<number>(8);

  const head = ATTENTION_HEADS.find((h) => h.id === selectedHeadId) || ATTENTION_HEADS[0];

  const handleSelectHead = (id: number) => {
    playHapticTone('tap');
    setSelectedHeadId(id);
    const chosen = ATTENTION_HEADS.find((h) => h.id === id);
    if (chosen) {
      setSelectedLayer(chosen.layer);
      // Speak the head role for screen readers
      const speech = SpeechController.getInstance();
      speech.speak(`${chosen.name}: ${chosen.role}`, 'en', 1.0, 1.0);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-4 gap-6 text-[#dae2fd]">
      {/* Heatmaps Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-code text-[11px] font-semibold text-[#4cd7f6] tracking-widest uppercase">
            Spatial Saliency &amp; Cross-Attention Explorer
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#171f33] text-[#4edea3] font-code text-[11px] border border-[#2d3449]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
            14×14 Patch Grid (196 Tokens)
          </span>
        </div>
        <h2 className="text-[20px] font-bold text-[#dae2fd]">
          Multi-Head Attention Distribution
        </h2>
        <p className="text-[13px] text-[#c7c4d7]">
          Probe how individual attention heads specialize in spatial geometry, color association, motion kinematics, and target manipulandum grounding.
        </p>
      </div>

      {/* Head Selector Chips */}
      <div className="flex flex-col gap-2.5 bg-[#171f33] p-4 rounded-xl border border-[#222a3d]">
        <div className="flex items-center justify-between">
          <span className="font-code text-[11px] font-semibold text-[#c7c4d7] uppercase">
            Select Attention Head (1 – 8)
          </span>
          <span className="font-code text-[11px] text-[#4cd7f6]">
            Layer {selectedLayer} / 12
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
          {ATTENTION_HEADS.map((h) => {
            const isSelected = h.id === selectedHeadId;
            return (
              <button
                key={h.id}
                onClick={() => handleSelectHead(h.id)}
                className={`p-2.5 rounded-lg text-left flex flex-col gap-1 transition-all border ${
                  isSelected
                    ? 'bg-[#c0c1ff] text-[#1000a9] border-[#c0c1ff] font-bold shadow-md'
                    : 'bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] border-[#2d3449]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-code text-[11px]">Head {h.id}</span>
                  <span className="text-[10px] font-code opacity-80">L{h.layer}</span>
                </div>
                <span className="text-[12px] truncate">{h.sampleToken}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Head Description */}
        <div className="bg-[#131b2e] p-3 rounded-lg border border-[#222a3d] flex flex-col gap-1 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#dae2fd]">{head.name}</span>
            <div className="flex items-center gap-2 font-code text-[11px]">
              <span className="text-[#4cd7f6]">Sparsity: {head.sparsity}</span>
              <span className="text-[#4edea3]">Entropy: {head.entropy} bits</span>
            </div>
          </div>
          <p className="text-[12px] text-[#c7c4d7]">{head.role}</p>
        </div>
      </div>

      {/* Visual Canvas with Heatmap Overlay */}
      <div className="relative rounded-xl overflow-hidden bg-[#060e20] shadow-xl border border-[#222a3d] flex flex-col">
        <div className="relative w-full aspect-[16/10] overflow-hidden flex items-center justify-center select-none">
          <img
            className="w-full h-full object-cover"
            src={currentSample.imgUrl}
            alt={currentSample.dataAlt}
          />

          {/* Dynamic Spatial Heatmap Layer */}
          <div
            style={{ opacity: heatmapOpacity }}
            className="absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-300"
          >
            {/* 14x14 cell grid overlay */}
            <div className="w-full h-full grid grid-cols-14 grid-rows-14">
              {head.matrix.flatMap((row, rIdx) =>
                row.map((val, cIdx) => {
                  if (val < threshold) return <div key={`${rIdx}-${cIdx}`} />;

                  let cellColor = '';
                  if (selectedColormap === 'cyber') {
                    cellColor = `rgba(76, 215, 246, ${val * 0.9})`;
                  } else if (selectedColormap === 'turbo') {
                    cellColor = val > 0.6 ? `rgba(255, 60, 40, ${val})` : `rgba(50, 100, 255, ${val})`;
                  } else if (selectedColormap === 'magma') {
                    cellColor = val > 0.5 ? `rgba(255, 200, 50, ${val})` : `rgba(160, 30, 160, ${val})`;
                  } else {
                    cellColor = `rgba(255, 255, 255, ${val * 0.95})`;
                  }

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      style={{ backgroundColor: cellColor }}
                      className="w-full h-full border border-black/10 transition-colors"
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Focal Bounding Box for Selected Head */}
          <div
            style={{
              top: head.focalBbox.top,
              left: head.focalBbox.left,
              width: head.focalBbox.width,
              height: head.focalBbox.height,
            }}
            className="absolute rounded border-2 border-[#4cd7f6] bg-[#4cd7f6]/10 transition-all duration-300 pointer-events-none flex items-start justify-end p-1 shadow-lg"
          >
            <span className="font-code text-[11px] font-bold text-[#003640] bg-[#4cd7f6] px-1.5 py-0.5 rounded shadow">
              {head.sampleToken}
            </span>
          </div>

          {/* Focal Coordinate Center Point */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 px-2.5 py-1 rounded bg-[#060e20]/90 text-[#dae2fd] font-code text-[12px] border border-[#2d3449]">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping"></span>
            <span>Head {head.id} Focus: ({head.centerCoords.x}, {head.centerCoords.y})</span>
          </div>
        </div>
      </div>

      {/* Heatmap Controls: Opacity, Threshold, Colormap */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#171f33] p-4 rounded-xl border border-[#222a3d]">
        {/* Opacity */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-[#c7c4d7]">Overlay Opacity</span>
            <span className="font-code text-[#4cd7f6]">{Math.round(heatmapOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={heatmapOpacity}
            onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
            className="accent-[#4cd7f6] cursor-pointer"
          />
        </div>

        {/* Threshold */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[13px]">
            <span className="text-[#c7c4d7]">Activation Cutoff</span>
            <span className="font-code text-[#4edea3]">{threshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.6"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="accent-[#4edea3] cursor-pointer"
          />
        </div>

        {/* Colormap */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] text-[#c7c4d7]">Colormap Scheme</span>
          <select
            value={selectedColormap}
            onChange={(e) => {
              playHapticTone('tap');
              setSelectedColormap(e.target.value);
            }}
            className="bg-[#131b2e] border border-[#2d3449] rounded-lg px-2.5 py-1.5 text-[12px] font-code text-[#dae2fd] outline-none"
          >
            {COLORMAPS.map((cm) => (
              <option key={cm.id} value={cm.id}>
                {cm.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bahdanau Additive vs Multi-Head Self-Attention Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] mb-4">
        <div className="p-3 rounded-lg bg-[#171f33] border border-[#222a3d] flex flex-col gap-2">
          <span className="font-code text-[11px] font-bold text-[#4edea3] uppercase">
            Baseline: Bahdanau Soft Additive
          </span>
          <p className="text-[12px] text-[#c7c4d7]">
            Single bottleneck scalar alignment score. Tends to blur across neighboring pixels, failing to isolate distinct boundaries or dual interacting entities.
          </p>
          <div className="font-code text-[11px] text-[#908fa0] bg-[#060e20] p-2 rounded">
            Entropy: 3.82 bits • Sparsity: 0.48
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#171f33] border border-[#222a3d] flex flex-col gap-2">
          <span className="font-code text-[11px] font-bold text-[#4cd7f6] uppercase">
            Transformer: Multi-Head Cross-Attention
          </span>
          <p className="text-[12px] text-[#c7c4d7]">
            Parallel attention subspaces isolate spatial coordinates, color palettes, and motion vectors into specialized, orthogonal representation heads.
          </p>
          <div className="font-code text-[11px] text-[#4cd7f6] bg-[#060e20] p-2 rounded">
            Entropy: 1.45 bits • Sparsity: 0.92
          </div>
        </div>
      </div>
    </div>
  );
};
