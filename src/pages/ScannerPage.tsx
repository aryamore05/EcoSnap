import { useRef, useState, useCallback } from 'react';
import {
  Upload,
  Camera,
  X,
  ScanLine,
  Loader2,
  RotateCcw,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Brain,
} from 'lucide-react';
import type { AnalysisResult, HealthStatus } from '@/types';
import { analyzeImage, saveObservation } from '@/api';
import { getDemoResult } from '@/demo';
import { ResultCard } from '@/components/ResultCard';
import { ErrorBanner } from '@/components/ErrorBanner';

interface ScannerPageProps {
  health: HealthStatus | null;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function ScannerPage({ health }: ScannerPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDemoResult, setIsDemoResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const backendOffline = health?.backend === 'offline';
  const aiOnline = health?.backend === 'online' && health?.ai_service === 'online';
  const aiDemo = health?.backend === 'online' && health?.ai_service === 'demo';
  const aiOffline = health?.backend === 'online' && health?.ai_service === 'offline';

  const handleFileSelect = useCallback((file: File | undefined) => {
    if (!file) return;
    setError(null);
    setResult(null);
    setSaved(false);
    setIsDemoResult(false);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setSaved(false);
    setIsDemoResult(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyzeReal = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setIsDemoResult(false);

    try {
      const analysis = await analyzeImage(selectedFile);
      setResult(analysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyse the image. Please check that the backend and AI model are running.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeDemo = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setIsDemoResult(false);

    await new Promise((resolve) => setTimeout(resolve, 1200));
    setResult(getDemoResult());
    setIsDemoResult(true);
    setAnalyzing(false);
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await saveObservation(result, selectedFile?.name ?? null);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save observation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-forest-900 sm:text-4xl">Scan Waste</h1>
        <p className="mt-2 text-forest-600/70">
          Upload or capture a photo and let the AI identify the waste category.
        </p>
      </div>

      {/* Status banner — reflects the real backend and AI state */}
      <div className="mt-6">
        <StatusBanner
          backendOffline={backendOffline}
          aiOnline={aiOnline}
          aiDemo={aiDemo}
          aiOffline={aiOffline}
          modelName={health?.model_name ?? null}
          message={health?.message}
        />
      </div>

      {/* Upload zone */}
      {!previewUrl && (
        <div className="mt-8">
          <div
            className="rounded-2xl border-2 border-dashed border-forest-200 bg-white/50 p-8 text-center transition-colors hover:border-forest-300 hover:bg-forest-50/30"
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelect(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-50 text-forest-600">
              <ScanLine size={32} />
            </div>
            <p className="mt-4 text-sm font-medium text-forest-700">
              Drag and drop an image here, or choose an option below
            </p>
            <p className="mt-1 text-xs text-forest-600/50">JPEG, PNG, or WebP — up to 10 MB</p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                <Upload size={18} /> Upload image
              </button>
              <button onClick={() => cameraInputRef.current?.click()} className="btn-secondary">
                <Camera size={18} /> Take photo
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? undefined)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? undefined)}
          />
        </div>
      )}

      {/* Preview + actions */}
      {previewUrl && (
        <div className="mt-8 space-y-4">
          <div className="card overflow-hidden">
            <div className="relative">
              <img src={previewUrl} alt="Selected waste" className="max-h-96 w-full object-contain bg-gray-50" />
              <button
                onClick={handleReset}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-forest-700 shadow-card transition-colors hover:bg-white"
                aria-label="Remove image"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!result && !analyzing && (
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {/* Real AI button — disabled when backend or AI is unavailable */}
              <button
                onClick={handleAnalyzeReal}
                disabled={backendOffline || aiOffline}
                className="btn-primary"
              >
                <Brain size={18} /> {aiOnline ? 'Analyse with AI' : 'Analyse with AI (unavailable)'}
              </button>

              {/* Demo button — always available, explicitly labeled as demo */}
              <button onClick={handleAnalyzeDemo} className="btn-secondary">
                <FlaskConical size={18} /> Try demo result
              </button>

              <button onClick={handleReset} className="btn-ghost">
                <RotateCcw size={18} /> Try another
              </button>
            </div>
          )}

          {analyzing && (
            <div className="card flex flex-col items-center justify-center gap-3 py-12">
              <div className="relative">
                <Loader2 size={40} className="animate-spin text-forest-600" />
              </div>
              <p className="text-sm font-medium text-forest-700">Analyzing your image...</p>
              <p className="text-xs text-forest-600/50">This may take a few seconds on local inference.</p>
            </div>
          )}
        </div>
      )}

      {/* Error — shows the real error, never hidden by demo fallback */}
      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          {isDemoResult && (
            <div className="flex items-start gap-3 rounded-xl border border-earth-300 bg-earth-100/60 px-4 py-3">
              <FlaskConical size={20} className="mt-0.5 flex-shrink-0 text-earth-700" />
              <p className="text-sm font-medium text-earth-900">
                This is a demo result, not real AI analysis. To get actual waste identification,
                install Ollama and pull the LLaVA vision model. See the About page or README for
                setup instructions.
              </p>
            </div>
          )}
          <ResultCard result={result} onSave={handleSave} saving={saving} saved={saved} />
          <div className="flex justify-center">
            <button onClick={handleReset} className="btn-ghost">
              <RotateCcw size={16} /> Scan another item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBanner({
  backendOffline,
  aiOnline,
  aiDemo,
  aiOffline,
  modelName,
  message,
}: {
  backendOffline: boolean;
  aiOnline: boolean;
  aiDemo: boolean;
  aiOffline: boolean;
  modelName: string | null;
  message: string | undefined;
}) {
  if (aiOnline) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-leaf-200 bg-leaf-50 px-4 py-3 text-sm text-leaf-800">
        <CheckCircle2 size={18} className="flex-shrink-0" />
        <span>AI backend is online — model "{modelName}" is ready for real waste analysis.</span>
      </div>
    );
  }

  if (aiDemo) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-earth-200 bg-earth-50 px-4 py-3">
        <FlaskConical size={20} className="mt-0.5 flex-shrink-0 text-earth-600" />
        <div className="text-sm text-earth-800">
          <p className="font-semibold">Backend demo mode</p>
          <p className="mt-0.5">
            The backend is running with DEMO_MODE=true. You can use "Try demo result" below, but it
            will not perform real AI analysis. Set DEMO_MODE=false and install Ollama for real results.
          </p>
        </div>
      </div>
    );
  }

  if (aiOffline) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-earth-200 bg-earth-50 px-4 py-3">
        <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-earth-600" />
        <div className="text-sm text-earth-800">
          <p className="font-semibold">AI model not available</p>
          <p className="mt-0.5">
            The FastAPI backend is running, but Ollama or the vision model is not installed.
            {message ? ` ${message}` : ''} Install Ollama and run{' '}
            <code className="rounded bg-earth-100 px-1 py-0.5 text-xs">ollama pull llava:7b</code> to
            enable real AI analysis. You can still try a demo result below.
          </p>
        </div>
      </div>
    );
  }

  // backendOffline
  return (
    <div className="flex items-start gap-3 rounded-xl border border-earth-200 bg-earth-50 px-4 py-3">
      <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-earth-600" />
      <div className="text-sm text-earth-800">
        <p className="font-semibold">Backend not running</p>
        <p className="mt-0.5">
          The FastAPI backend is not running, so real AI analysis is unavailable. You can still try
          a demo result below. To enable real waste identification, start the backend with Ollama.
          See the About page or README for setup instructions.
        </p>
      </div>
    </div>
  );
}
