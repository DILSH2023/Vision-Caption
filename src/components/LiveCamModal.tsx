import React, { useRef, useState, useEffect } from 'react';
import { SampleData } from '../types';
import { textToBraille, playHapticTone } from '../utils/audio';

interface LiveCamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSampleCreated: (newSample: SampleData) => void;
}

export const LiveCamModal: React.FC<LiveCamModalProps> = ({ isOpen, onClose, onSampleCreated }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setErrorMessage('');
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
        setHasPermission(true);
      } else {
        throw new Error('MediaDevices not supported');
      }
    } catch (err: unknown) {
      console.warn('Camera access unavailable, fallback active:', err);
      setHasPermission(false);
      setErrorMessage('Camera access restricted or unavailable in this environment.');
    }
  };

  const capturePhoto = () => {
    setIsCapturing(true);
    playHapticTone('tap');

    let capturedDataUrl = '';

    if (videoRef.current && hasPermission) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    // Fallback simulated camera canvas if camera hardware not available
    if (!capturedDataUrl) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw modern studio gradient test scene
        const grad = ctx.createLinearGradient(0, 0, 640, 480);
        grad.addColorStop(0, '#101c3d');
        grad.addColorStop(0.5, '#1e2942');
        grad.addColorStop(1, '#0b1326');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 480);

        // Draw focal geometric test pattern
        ctx.strokeStyle = '#4cd7f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(180, 120, 280, 240);

        ctx.fillStyle = '#c0c1ff';
        ctx.font = '20px sans-serif';
        ctx.fillText('Live Scene Capture', 220, 240);
        capturedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    // Stop stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setTimeout(() => {
      const title = 'Live Cam Snapshot';
      const sotaCaption = 'An instantaneous live viewpoint capturing immediate indoor surroundings with balanced focus.';
      const newSample: SampleData = {
        id: `cam-${Date.now()}`,
        code: `#${Math.floor(7000 + Math.random() * 2000)}`,
        title,
        imgUrl: capturedDataUrl,
        thumbUrl: capturedDataUrl,
        dataAlt: sotaCaption,
        baseline: 'An indoor scene photographed with a live digital camera sensor.',
        baselineMetrics: {
          bleu4: 24.1,
          cider: 0.71,
          meteor: 0.21,
          latencyMs: 18,
        },
        sota: sotaCaption,
        sotaMetrics: {
          bleu4: 39.0,
          cider: 1.26,
          spice: 0.23,
          latencyMs: 41,
        },
        zeroShotMetrics: {
          baseline: { bleu4: 18.5, cider: 0.53, meteor: 0.17, latencyMs: 19 },
          sota: { bleu4: 34.0, cider: 1.09, spice: 0.20, latencyMs: 43 },
        },
        tokens: [
          { word: 'live', conf: '96%', bbox: { top: '25%', left: '25%', width: '50%', height: '50%' }, focusCoord: { top: '48%', left: '50%', label: 'live: 0.96', alpha: 'α_head: 0.95' } },
          { word: 'viewpoint', conf: '93%', bbox: { top: '20%', left: '20%', width: '60%', height: '60%' }, focusCoord: { top: '50%', left: '52%', label: 'view: 0.93', alpha: 'α_head: 0.92' } },
          { word: 'indoor', conf: '91%', bbox: { top: '10%', left: '10%', width: '80%', height: '80%' }, focusCoord: { top: '40%', left: '45%', label: 'room: 0.91', alpha: 'α_head: 0.90' } },
          { word: 'surroundings', conf: '88%', bbox: { top: '15%', left: '15%', width: '70%', height: '70%' }, focusCoord: { top: '55%', left: '55%', label: 'ambience: 0.88', alpha: 'α_head: 0.89' } },
        ],
        translations: {
          en: sotaCaption,
          es: 'Un punto de vista en vivo instantáneo que captura el entorno interior inmediato con enfoque equilibrado.',
          fr: 'Un point de vue instantané capturant l’environnement intérieur immédiat avec une mise au point équilibrée.',
          hi: 'संतुलित फोकस के साथ तात्कालिक इनडोर परिवेश को कैप्चर करता एक लाइव दृश्य।',
          ja: 'バランスの取れたフォーカスで直接的な屋内の周囲を捉えた瞬間的なライブ視点。',
          ar: 'وجهة نظر حية فورية تلتقط المناطق المحيطة الداخلية المباشرة مع تركيز متوازن.',
          de: 'Ein spontaner Live-Blickwinkel, der die unmittelbare Innenraumumgebung mit ausgewogenem Fokus einfängt.',
          zh: '一个即时的实时视角，以平衡的对焦捕捉直接的室内环境。',
        },
        phonetics: 'L-AY-V V-Y-UW-P-OY-N-T',
        phoneticsDetail: {
          ipa: '/laɪv ˈvjuːpɔɪnt/',
          arpabet: 'L AY V V Y UW P OY N T',
          syllables: ['live', 'view-point'],
        },
        braille: textToBraille(sotaCaption.slice(0, 36)),
        focusCoord: { top: '48%', left: '50%', label: 'sensor: 0.95', alpha: 'α_optic: 0.94' },
        secondaryBbox: { top: '25%', left: '25%', width: '50%', height: '50%', label: 'center: 0.95' },
        coordPixels: { x: 320, y: 240 },
      };

      setIsCapturing(false);
      playHapticTone('success');
      onSampleCreated(newSample);
      onClose();
    }, 800);
  };

  const toggleFacingMode = () => {
    playHapticTone('tap');
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="livecam-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#171f33] border border-[#2d3449] rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-[#dae2fd]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#2d3449]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[22px]">photo_camera</span>
            <h3 id="livecam-title" className="text-[18px] font-semibold text-[#dae2fd]">
              Live Camera Capture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c7c4d7] hover:text-white hover:bg-[#222a3d]"
            aria-label="Close camera dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black flex items-center justify-center border border-[#2d3449]">
          {hasPermission ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
              <span className="material-symbols-outlined text-[#908fa0] text-[48px]">videocam_off</span>
              <p className="text-[13px] text-[#c7c4d7]">{errorMessage || 'Camera stream simulated.'}</p>
              <button
                onClick={startCamera}
                className="px-3 py-1.5 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[13px] text-[#4cd7f6] flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                Retry Camera
              </button>
            </div>
          )}

          {/* Saliency Crosshair HUD */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border border-dashed border-[#4cd7f6]/60 rounded-xl relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping absolute"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]"></span>
              <span className="absolute -top-3 bg-[#060e20]/90 px-2 py-0.5 rounded text-[10px] font-code text-[#4cd7f6]">
                Target Alignment
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={toggleFacingMode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[13px] text-[#dae2fd]"
            title="Switch front/back camera"
          >
            <span className="material-symbols-outlined text-[18px]">flip_camera_ios</span>
            <span>Switch</span>
          </button>

          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4cd7f6] text-[#003640] font-semibold text-[14px] hover:bg-[#80e5fb] active:scale-95 shadow-lg transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCapturing ? 'hourglass_top' : 'camera'}
            </span>
            <span>{isCapturing ? 'Analyzing...' : 'Capture & Analyze'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-[#222a3d] hover:bg-[#2d3449] text-[13px] text-[#dae2fd]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
