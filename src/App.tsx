import React, { useState, useEffect } from 'react';
import { ViewTab, WorkbenchMode, AccessibilitySettings, SampleData } from './types';
import { SAMPLE_DATA } from './data/samples';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LiveDemo } from './components/LiveDemo';
import { BenchmarksView } from './components/BenchmarksView';
import { HeatmapsView } from './components/HeatmapsView';
import { ResearchView } from './components/ResearchView';
import { UploadModal } from './components/UploadModal';
import { LiveCamModal } from './components/LiveCamModal';
import { PhoneticsModal } from './components/PhoneticsModal';
import { SettingsModal } from './components/SettingsModal';
import { WcagAuditModal } from './components/WcagAuditModal';
import { SpeechController } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('live-demo');
  const [workbenchMode, setWorkbenchMode] = useState<WorkbenchMode>('a11y');
  const [samples, setSamples] = useState<SampleData[]>(SAMPLE_DATA);
  const [currentSampleIdx, setCurrentSampleIdx] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isLiveCamOpen, setIsLiveCamOpen] = useState<boolean>(false);
  const [isPhoneticsOpen, setIsPhoneticsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWcagAuditOpen, setIsWcagAuditOpen] = useState<boolean>(false);

  // Accessibility Settings
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    speechRate: 1.0,
    speechPitch: 1.0,
    autoSpeak: false,
    haptics: true,
    soundEffects: true,
    fontSize: 'standard',
  });

  // Apply high-contrast mode class to body/html
  useEffect(() => {
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings.highContrast]);

  // Global TTS toggle: reads out the current screen's core content
  const handleToggleGlobalTts = () => {
    const speech = SpeechController.getInstance();

    if (isSpeaking) {
      speech.stop();
      setIsSpeaking(false);
      return;
    }

    let speechText = '';
    const sample = samples[currentSampleIdx] || samples[0];

    if (currentTab === 'live-demo') {
      speechText = `VisionCaption Live Demo. Sample ${sample.title}. Caption: ${sample.sota}. Baseline caption: ${sample.baseline}.`;
    } else if (currentTab === 'benchmark-study') {
      speechText = `VisionCaption Benchmark Study. Comparing baseline ResNet50 LSTM at twenty-four point eight BLEU-4 versus BLIP transformer at thirty-nine point four BLEU-4 and one point twenty-eight CIDEr score.`;
    } else if (currentTab === 'attention-maps') {
      speechText = `VisionCaption Spatial Attention Explorer. Showing cross-attention head activations across fourteen by fourteen patch tokens.`;
    } else if (currentTab === 'methodology-dataset') {
      speechText = `VisionCaption Research Methodology. Multi-Head Cross-Attention versus Additive Recurrent Encoders in Accessible Screen-Reading Architectures. All outputs compliant with WCAG two point two level AAA.`;
    }

    setIsSpeaking(true);
    speech.speak(
      speechText,
      'en',
      settings.speechRate,
      settings.speechPitch,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const handleAddNewSample = (newSample: SampleData) => {
    setSamples((prev) => [newSample, ...prev]);
    setCurrentSampleIdx(0);
  };

  const currentSample = samples[currentSampleIdx] || samples[0];

  // Font size scale class
  const fontSizeClass =
    settings.fontSize === 'large'
      ? 'text-[17px]'
      : settings.fontSize === 'xlarge'
      ? 'text-[19px]'
      : 'text-[15px]';

  return (
    <div
      className={`min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col antialiased selection:bg-[#8083ff]/40 selection:text-white ${fontSizeClass} ${
        settings.highContrast ? 'high-contrast' : ''
      }`}
    >
      {/* Screen reader live announcement area */}
      <div className="sr-only" aria-live="polite" role="status">
        {`Current screen: ${currentTab}. Selected sample: ${currentSample.title}.`}
      </div>

      {/* Persistent Top Navigation Bar */}
      <Header
        currentTab={currentTab}
        highContrast={settings.highContrast}
        onToggleHighContrast={() =>
          setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }))
        }
        isSpeaking={isSpeaking}
        onToggleGlobalTts={handleToggleGlobalTts}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Screen Content Viewport */}
      <main className="flex-1 w-full pt-16 pb-20 bg-[#0b1326] flex flex-col">
        {currentTab === 'live-demo' && (
          <LiveDemo
            samples={samples}
            currentSampleIdx={currentSampleIdx}
            onSelectSampleIdx={(idx) => setCurrentSampleIdx(idx)}
            workbenchMode={workbenchMode}
            onChangeWorkbenchMode={(mode) => setWorkbenchMode(mode)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenLiveCam={() => setIsLiveCamOpen(true)}
            onOpenPhonetics={() => setIsPhoneticsOpen(true)}
            onOpenWcagAudit={() => setIsWcagAuditOpen(true)}
            settings={settings}
          />
        )}

        {currentTab === 'benchmark-study' && <BenchmarksView />}

        {currentTab === 'attention-maps' && <HeatmapsView currentSample={currentSample} />}

        {currentTab === 'methodology-dataset' && <ResearchView />}
      </main>

      {/* Persistent Bottom Tab Bar */}
      <BottomNav currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Interactive Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSampleCreated={handleAddNewSample}
      />

      <LiveCamModal
        isOpen={isLiveCamOpen}
        onClose={() => setIsLiveCamOpen(false)}
        onSampleCreated={handleAddNewSample}
      />

      <PhoneticsModal
        sample={currentSample}
        isOpen={isPhoneticsOpen}
        onClose={() => setIsPhoneticsOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        onOpenAudit={() => setIsWcagAuditOpen(true)}
      />

      <WcagAuditModal
        isOpen={isWcagAuditOpen}
        onClose={() => setIsWcagAuditOpen(false)}
      />
    </div>
  );
}
