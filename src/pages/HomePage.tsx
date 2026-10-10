import { ScanLine, BarChart3, Camera, Brain, Trash2, MapPin, ShieldCheck, Wifi } from 'lucide-react';
import type { Page, Stats, HealthStatus } from '@/types';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  stats: Stats | null;
  health: HealthStatus | null;
}

export function HomePage({ onNavigate, stats, health }: HomePageProps) {
  const heroImage = 'https://images.pexels.com/photos/33279922/pexels-photo-33279922.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Sunlight filtering through green forest leaves"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-900/60 via-forest-900/40 to-sand-50" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <span className="badge bg-leaf-500/20 text-leaf-200 backdrop-blur-sm">
              <MapPin size={14} /> Hacktoberfest 2026 — Touch Grass
            </span>
            <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Small Actions.<br />A Cleaner Planet.
            </h1>
            <p className="mt-4 text-lg text-white/85 sm:text-xl">
              Discover waste. Learn the right action. Make your surroundings cleaner.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => onNavigate('scan')} className="btn-primary text-base">
                <ScanLine size={20} /> Scan Waste
              </button>
              <button
                onClick={() => onNavigate('impact')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20 active:scale-[0.98]"
              >
                <BarChart3 size={20} /> Explore My Impact
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-forest-900">How EcoSnap Works</h2>
          <p className="mt-2 text-forest-600/70">Three simple steps from spotting waste to taking action.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <StepCard
            num="1"
            icon={Camera}
            title="Capture or upload"
            text="Take a photo of waste you've found, or upload an existing image from your device."
          />
          <StepCard
            num="2"
            icon={Brain}
            title="AI identifies it"
            text="A local open-weight vision model analyses the image and identifies the likely waste category."
          />
          <StepCard
            num="3"
            icon={Trash2}
            title="Act responsibly"
            text="Get clear disposal guidance, safety warnings, and save your observation to track your impact."
          />
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h2 className="font-heading text-2xl font-bold text-forest-900">Your Activity</h2>
          <p className="mt-1 text-sm text-forest-600/70">
            These are your own recorded actions, not global statistics.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <StatCard
              label="Items scanned"
              value={stats?.total_observations ?? 0}
              icon={Camera}
              color="text-sky-700 bg-sky-50"
            />
            <StatCard
              label="Items collected"
              value={stats?.total_items_collected ?? 0}
              icon={Trash2}
              color="text-leaf-700 bg-leaf-50"
            />
            <StatCard
              label="Cleanup activities"
              value={stats?.total_cleanups ?? 0}
              icon={BarChart3}
              color="text-forest-700 bg-forest-50"
            />
          </div>
        </div>
      </section>

      {/* Privacy + AI note */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <InfoCard
            icon={ShieldCheck}
            title="Your photos stay local"
            text="When configured for local inference with Ollama, image analysis runs entirely on your device. Your photographs are not uploaded to any third-party AI provider."
          />
          <InfoCard
            icon={Wifi}
            title="AI service status"
            text={
              health?.backend === 'online'
                ? health.ai_service === 'online'
                  ? `Backend is online. AI model "${health.model_name}" is ready for real waste analysis.`
                  : health.ai_service === 'demo'
                    ? 'Backend is running in demo mode (DEMO_MODE=true). No real AI analysis is performed. Set DEMO_MODE=false and install Ollama for real results.'
                    : 'Backend is running but the AI model is not available. Install Ollama and pull the llava:7b vision model to enable analysis.'
                : 'Backend is not running. Start the FastAPI server with Ollama to enable AI-powered waste analysis. You can still try a demo result on the Scan page.'
            }
            status={health?.backend === 'online' ? 'online' : 'offline'}
          />
        </div>
      </section>
    </div>
  );
}

function StepCard({ num, icon: Icon, title, text }: { num: string; icon: typeof Camera; title: string; text: string }) {
  return (
    <div className="card card-hover p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-600 font-heading text-lg font-bold text-white">
          {num}
        </span>
        <Icon size={24} className="text-forest-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-forest-900">{title}</h3>
      <p className="mt-2 text-sm text-forest-600/80">{text}</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Camera; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon size={24} />
      </span>
      <div>
        <p className="font-heading text-3xl font-bold text-forest-900">{value}</p>
        <p className="text-sm text-forest-600/70">{label}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text, status }: { icon: typeof Camera; title: string; text: string; status?: 'online' | 'offline' }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700">
          <Icon size={20} />
        </span>
        <h3 className="text-lg font-semibold text-forest-900">{title}</h3>
        {status && (
          <span className={`ml-auto badge ${status === 'online' ? 'bg-leaf-100 text-leaf-800' : 'bg-red-100 text-red-800'}`}>
            {status === 'online' ? 'Online' : 'Offline'}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-forest-600/80">{text}</p>
    </div>
  );
}
