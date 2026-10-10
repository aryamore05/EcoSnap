import { Leaf, Home, ScanLine, BarChart3, Lightbulb, Info } from 'lucide-react';
import type { Page } from '@/types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'scan', label: 'Scan Waste', icon: ScanLine },
  { id: 'impact', label: 'My Impact', icon: BarChart3 },
  { id: 'tips', label: 'Eco Tips', icon: Lightbulb },
  { id: 'about', label: 'About', icon: Info },
];

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-sand-200/60">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 font-heading text-lg font-bold text-forest-700"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-600 text-white">
              <Leaf size={20} />
            </span>
            <span className="hidden sm:inline">EcoSnap</span>
          </button>

          <div className="flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  currentPage === id
                    ? 'bg-forest-50 text-forest-700'
                    : 'text-forest-600/70 hover:bg-forest-50/50 hover:text-forest-700'
                }`}
              >
                <Icon size={16} />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
