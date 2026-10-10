import { ScanLine, ShieldCheck, Brain, Heart, Code } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-forest-900 sm:text-4xl">About EcoSnap</h1>
        <p className="mt-2 text-forest-600/70">
          An open-source, AI-powered environmental assistant built for the Hacktoberfest 2026 Open-Source AI Challenge.
        </p>
      </div>

      {/* Mission */}
      <div className="mt-10 card p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-forest-600 text-white">
            <Heart size={24} />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold text-forest-900">Our mission</h2>
            <p className="mt-2 text-sm text-forest-600/80">
              EcoSnap helps people identify waste in their surroundings, learn how to dispose of it responsibly,
              and track their cleanup activities. We believe small, informed actions add up to a cleaner planet.
            </p>
            <p className="mt-2 text-sm text-forest-600/80">
              The app is designed for the "Touch Grass" theme — it encourages you to go outdoors, observe
              environmental problems, take practical action, and then put your phone away.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <FeatureCard
          icon={ScanLine}
          title="Waste identification"
          text="Upload or capture a photo and a local vision model identifies the waste category, suggests disposal actions, and flags safety concerns."
        />
        <FeatureCard
          icon={ShieldCheck}
          title="Privacy first"
          text="When configured for local inference, your photos never leave your device. No third-party AI providers, no cloud uploads."
        />
        <FeatureCard
          icon={Brain}
          title="Open-weight AI"
          text="EcoSnap uses LLaVA, an open-weight vision-language model running through Ollama. No paid API keys required for the primary workflow."
        />
        <FeatureCard
          icon={Code}
          title="Open source"
          text="The entire codebase is open source and beginner-friendly. Built with React, TypeScript, FastAPI, and SQLite."
        />
      </div>

    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }: { icon: typeof ScanLine; title: string; text: string }) {
  return (
    <div className="card card-hover p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700">
        <Icon size={20} />
      </span>
      <h3 className="mt-4 text-base font-semibold text-forest-900">{title}</h3>
      <p className="mt-1.5 text-sm text-forest-600/80">{text}</p>
    </div>
  );
}
