import { Leaf, Github, Heart } from 'lucide-react';
import type { Page } from '@/types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-sand-200/60 bg-white/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 font-heading text-lg font-bold text-forest-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-600 text-white">
              <Leaf size={18} />
            </span>
            EcoSnap
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-forest-600/70">
            <button onClick={() => onNavigate('home')} className="hover:text-forest-700">Home</button>
            <button onClick={() => onNavigate('scan')} className="hover:text-forest-700">Scan Waste</button>
            <button onClick={() => onNavigate('impact')} className="hover:text-forest-700">My Impact</button>
            <button onClick={() => onNavigate('tips')} className="hover:text-forest-700">Eco Tips</button>
            <button onClick={() => onNavigate('about')} className="hover:text-forest-700">About</button>
          </nav>

          <div className="flex items-center gap-4 text-sm text-forest-600/60">
            <span className="flex items-center gap-1.5">
              Built with <Heart size={14} className="text-leaf-600" /> for Hacktoberfest 2026
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-forest-700"
            >
              <Github size={16} />
              <span className="hidden sm:inline">Source</span>
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-forest-600/50">
          EcoSnap uses open-weight AI models for local image analysis. Your photos stay on your device when local inference is configured.
        </p>
      </div>
    </footer>
  );
}
