import { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { ScannerPage } from '@/pages/ScannerPage';
import { ImpactPage } from '@/pages/ImpactPage';
import { TipsPage } from '@/pages/TipsPage';
import { AboutPage } from '@/pages/AboutPage';
import { checkHealth, getStats } from '@/api';
import type { Page, Stats, HealthStatus } from '@/types';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const refreshHealth = useCallback(async () => {
    const status = await checkHealth();
    setHealth(status);
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch {
      // Backend offline — stats will show zeros
      setStats({
        total_observations: 0,
        total_items_collected: 0,
        total_cleanups: 0,
        category_breakdown: {},
        recent_observations: [],
        recent_cleanups: [],
      });
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    refreshStats();
  }, [refreshHealth, refreshStats]);

  // Refresh stats when returning to home or impact page
  useEffect(() => {
    if (currentPage === 'home' || currentPage === 'impact') {
      refreshStats();
    }
  }, [currentPage, refreshStats]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} stats={stats} health={health} />}
        {currentPage === 'scan' && <ScannerPage health={health} />}
        {currentPage === 'impact' && <ImpactPage />}
        {currentPage === 'tips' && <TipsPage />}
        {currentPage === 'about' && <AboutPage />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
