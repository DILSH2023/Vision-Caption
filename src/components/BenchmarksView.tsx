import React, { useState } from 'react';
import { BENCHMARK_MODELS, DATASET_SPLITS, HUMAN_EVALUATION_SCORES } from '../data/benchmarks';
import { playHapticTone } from '../utils/audio';

export const BenchmarksView: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'bleu4' | 'cider' | 'meteor' | 'latencyMs' | 'chairRate'>('cider');
  const [activeDatasetTab, setActiveDatasetTab] = useState<number>(0);

  const metricInfo: Record<string, { label: string; unit: string; description: string; best: 'high' | 'low' }> = {
    bleu4: { label: 'BLEU-4', unit: 'pts', description: '4-gram precision matching against human reference captions', best: 'high' },
    cider: { label: 'CIDEr', unit: 'score', description: 'Consensus-based TF-IDF image description evaluation', best: 'high' },
    meteor: { label: 'METEOR', unit: 'score', description: 'Harmonic mean of unigram precision/recall with stemming & synonymy', best: 'high' },
    latencyMs: { label: 'Inference Latency', unit: 'ms', description: 'Forward pass latency on NVIDIA T4 Tensor Core GPU', best: 'low' },
    chairRate: { label: 'CHAIRi Hallucination', unit: '%', description: 'Percentage of generated noun objects absent from ground truth', best: 'low' },
  };

  const getMetricValue = (model: typeof BENCHMARK_MODELS[0], metric: string): number => {
    return model[metric as keyof typeof model] as number;
  };

  const maxMetricValue = Math.max(...BENCHMARK_MODELS.map((m) => getMetricValue(m, selectedMetric)));

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-4 gap-6 text-[#dae2fd]">
      {/* Benchmark Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-code text-[11px] font-semibold text-[#4cd7f6] tracking-widest uppercase">
            Comparative Benchmark Study
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#171f33] text-[#c0c1ff] font-code text-[11px] border border-[#2d3449]">
            <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">speed</span>
            NVIDIA T4 / PyTorch 2.4
          </span>
        </div>
        <h2 className="text-[20px] font-bold text-[#dae2fd]">
          Vision-Language Architecture Evaluation
        </h2>
        <p className="text-[13px] text-[#c7c4d7]">
          Rigorous empirical comparison between classical CNN-LSTM baselines, prefix-tuned models, and SOTA multi-head cross-attention vision transformers.
        </p>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-col gap-2 bg-[#171f33] p-4 rounded-xl border border-[#222a3d]">
        <div className="flex items-center justify-between">
          <span className="font-code text-[11px] font-semibold text-[#c7c4d7] uppercase">
            Focus Metric
          </span>
          <span className="font-code text-[11px] text-[#4edea3]">
            {metricInfo[selectedMetric].description}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
          {(['cider', 'bleu4', 'meteor', 'latencyMs', 'chairRate'] as const).map((m) => {
            const isSelected = selectedMetric === m;
            return (
              <button
                key={m}
                onClick={() => {
                  playHapticTone('tap');
                  setSelectedMetric(m);
                }}
                className={`py-2 px-2.5 rounded-lg font-code text-[12px] flex flex-col items-center gap-0.5 transition-all ${
                  isSelected
                    ? 'bg-[#c0c1ff] text-[#1000a9] font-bold shadow-md'
                    : 'bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd]'
                }`}
              >
                <span>{metricInfo[m].label}</span>
                <span className="text-[10px] opacity-75">
                  {metricInfo[m].best === 'high' ? 'Higher is better' : 'Lower is better'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Visual Comparison Bar Chart */}
        <div className="flex flex-col gap-3 pt-3 border-t border-[#222a3d] mt-2">
          {BENCHMARK_MODELS.map((model) => {
            const val = getMetricValue(model, selectedMetric);
            const percentage = Math.max(8, Math.round((val / (maxMetricValue || 1)) * 100));
            const isRecommended = model.recommended;

            return (
              <div key={model.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#dae2fd]">{model.name}</span>
                    {isRecommended && (
                      <span className="px-1.5 py-0.2 rounded bg-[#00885d]/30 text-[#4edea3] font-code text-[10px] font-bold">
                        Workbench Model
                      </span>
                    )}
                  </div>
                  <span className="font-code font-bold text-[#c0c1ff]">
                    {val} {metricInfo[selectedMetric].unit}
                  </span>
                </div>
                {/* Bar */}
                <div className="w-full h-3 bg-[#060e20] rounded-full overflow-hidden p-0.5 border border-[#222a3d]">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isRecommended
                        ? 'bg-gradient-to-r from-[#4cd7f6] to-[#4edea3]'
                        : model.type === 'Baseline'
                        ? 'bg-[#908fa0]'
                        : 'bg-[#8083ff]'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Benchmark Matrix Table */}
      <div className="flex flex-col gap-2.5 bg-[#171f33] p-4 rounded-xl border border-[#222a3d] overflow-x-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#dae2fd]">Full Evaluation Matrix</h3>
          <span className="font-code text-[11px] text-[#4cd7f6]">Flickr8k Test Set (N=1,000)</span>
        </div>

        <table className="w-full text-left border-collapse text-[12px] font-code">
          <thead>
            <tr className="border-b border-[#2d3449] text-[#c7c4d7]">
              <th className="py-2 pr-3">Architecture</th>
              <th className="py-2 px-2">Params</th>
              <th className="py-2 px-2">BLEU-4</th>
              <th className="py-2 px-2">CIDEr</th>
              <th className="py-2 px-2">METEOR</th>
              <th className="py-2 px-2">SPICE</th>
              <th className="py-2 px-2">Latency</th>
              <th className="py-2 pl-2">CHAIRi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222a3d]">
            {BENCHMARK_MODELS.map((m) => (
              <tr
                key={m.id}
                className={m.recommended ? 'bg-[#c0c1ff]/10 font-medium' : 'hover:bg-[#222a3d]/50'}
              >
                <td className="py-2.5 pr-3 text-[#dae2fd] font-sans font-medium whitespace-nowrap">
                  {m.name}
                </td>
                <td className="py-2.5 px-2 text-[#c7c4d7]">{m.parametersM}M</td>
                <td className="py-2.5 px-2 text-[#4edea3] font-bold">{m.bleu4}</td>
                <td className="py-2.5 px-2 text-[#4cd7f6] font-bold">{m.cider}</td>
                <td className="py-2.5 px-2 text-[#dae2fd]">{m.meteor}</td>
                <td className="py-2.5 px-2 text-[#c0c1ff]">{m.spice}</td>
                <td className="py-2.5 px-2 text-[#dae2fd]">{m.latencyMs}ms</td>
                <td className="py-2.5 pl-2 text-[#ffb4ab]">{m.chairRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dataset Splits Breakdown */}
      <div className="flex flex-col gap-2.5 bg-[#171f33] p-4 rounded-xl border border-[#222a3d]">
        <h3 className="text-[16px] font-semibold text-[#dae2fd]">Dataset Partition Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {DATASET_SPLITS.map((split, i) => (
            <button
              key={split.name}
              onClick={() => {
                playHapticTone('tap');
                setActiveDatasetTab(i);
              }}
              className={`p-3 rounded-lg text-left border flex flex-col gap-1 transition-all ${
                activeDatasetTab === i
                  ? 'bg-[#222a3d] border-[#4cd7f6]'
                  : 'bg-[#131b2e] border-[#222a3d] hover:border-[#464554]'
              }`}
            >
              <span className="font-bold text-[14px] text-[#dae2fd]">{split.name}</span>
              <span className="text-[11px] text-[#c7c4d7]">{split.domain}</span>
              <div className="font-code text-[10px] text-[#4edea3] mt-1">
                Train: {split.train.toLocaleString()} | Test: {split.test.toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Human Evaluation Study */}
      <div className="flex flex-col gap-2.5 bg-[#131b2e] p-4 rounded-xl border border-[#222a3d] mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#dae2fd]">Blind Human Evaluation (N=50 Evaluators)</h3>
          <span className="font-code text-[11px] text-[#4edea3]">5-Point Likert Scale</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {HUMAN_EVALUATION_SCORES.map((score) => (
            <div
              key={score.model}
              className="p-3 rounded-lg bg-[#171f33] border border-[#222a3d] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[13px] text-[#dae2fd]">{score.model}</span>
                <span className="font-code text-[12px] font-bold text-[#4cd7f6]">
                  {score.a11yUtility}/5.0 A11y
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-code">
                <div className="bg-[#060e20] p-1.5 rounded">
                  <span className="text-[#908fa0] block">Fluency</span>
                  <span className="text-[#4edea3] font-bold">{score.fluency}</span>
                </div>
                <div className="bg-[#060e20] p-1.5 rounded">
                  <span className="text-[#908fa0] block">Factual</span>
                  <span className="text-[#c0c1ff] font-bold">{score.factual}</span>
                </div>
                <div className="bg-[#060e20] p-1.5 rounded">
                  <span className="text-[#908fa0] block">Detail</span>
                  <span className="text-[#4cd7f6] font-bold">{score.detail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
