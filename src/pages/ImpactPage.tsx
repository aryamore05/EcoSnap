import { useEffect, useState, useCallback } from 'react';
import {
  Trash2,
  Camera,
  BarChart3,
  Plus,
  Loader2,
  Inbox,
  Calendar,
  DeleteIcon,
  AlertCircle,
} from 'lucide-react';
import type { Stats, CleanupActivity, Observation } from '@/types';
import { getStats, deleteObservation, recordCleanup } from '@/api';
import { categoryIcon, categoryColors } from '@/data';
import { ErrorBanner } from '@/components/ErrorBanner';

export function ImpactPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCleanupForm, setShowCleanupForm] = useState(false);
  const [cleanupDesc, setCleanupDesc] = useState('');
  const [cleanupCount, setCleanupCount] = useState(1);
  const [saving, setSaving] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleDelete = async (id: number) => {
    try {
      await deleteObservation(id);
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete observation.');
    }
  };

  const handleRecordCleanup = async () => {
    if (!cleanupDesc.trim()) return;
    setSaving(true);
    try {
      await recordCleanup(cleanupDesc.trim(), cleanupCount);
      setCleanupDesc('');
      setCleanupCount(1);
      setShowCleanupForm(false);
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record cleanup.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-forest-600" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorBanner
          message={`Unable to load your activity data. ${error} Make sure the backend server is running.`}
        />
      </div>
    );
  }

  const hasData = stats && (stats.total_observations > 0 || stats.total_cleanups > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-forest-900 sm:text-4xl">My Eco Impact</h1>
          <p className="mt-1 text-forest-600/70">Track your waste observations and cleanup activities.</p>
        </div>
        <button onClick={() => setShowCleanupForm(!showCleanupForm)} className="btn-primary">
          <Plus size={18} /> Record cleanup
        </button>
      </div>

      {error && <div className="mt-4"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      {/* Cleanup form */}
      {showCleanupForm && (
        <div className="mt-6 card p-6 animate-fade-up">
          <h3 className="text-lg font-semibold text-forest-900">Record a cleanup activity</h3>
          <p className="mt-1 text-sm text-forest-600/70">
            Record items you actually collected — not just photographed. This keeps your impact honest.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-forest-700">What did you do?</label>
              <input
                type="text"
                value={cleanupDesc}
                onChange={(e) => setCleanupDesc(e.target.value)}
                placeholder="e.g. Collected plastic bottles from the riverbank"
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-700">Items collected</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={cleanupCount}
                onChange={(e) => setCleanupCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field mt-1 w-32"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleRecordCleanup} disabled={saving || !cleanupDesc.trim()} className="btn-primary">
                {saving ? 'Saving...' : 'Save activity'}
              </button>
              <button onClick={() => setShowCleanupForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats overview */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatBox label="Items scanned" value={stats?.total_observations ?? 0} icon={Camera} color="bg-sky-50 text-sky-700" />
        <StatBox label="Items collected" value={stats?.total_items_collected ?? 0} icon={Trash2} color="bg-leaf-50 text-leaf-700" />
        <StatBox label="Cleanup activities" value={stats?.total_cleanups ?? 0} icon={BarChart3} color="bg-forest-50 text-forest-700" />
      </div>

      {/* Category breakdown */}
      {stats && Object.keys(stats.category_breakdown).length > 0 && (
        <div className="mt-6 card p-6">
          <h3 className="text-lg font-semibold text-forest-900">Waste categories identified</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.category_breakdown).map(([category, count]) => {
              const Icon = categoryIcon[category as keyof typeof categoryIcon];
              const colors = categoryColors[category as keyof typeof categoryColors];
              return (
                <div key={category} className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-forest-700">{category}</span>
                  <span className="text-sm font-bold text-forest-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <div className="mt-8 card flex flex-col items-center justify-center py-16 text-center">
          <Inbox size={48} className="text-forest-300" />
          <h3 className="mt-4 text-lg font-semibold text-forest-700">No activity yet</h3>
          <p className="mt-1 text-sm text-forest-600/60">
            Scan your first piece of waste or record a cleanup to start tracking your impact.
          </p>
        </div>
      )}

      {/* Recent observations */}
      {stats && stats.recent_observations.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-xl font-bold text-forest-900">Recent observations</h2>
          <div className="mt-4 space-y-3">
            {stats.recent_observations.map((obs) => (
              <ObservationRow key={obs.id} obs={obs} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Recent cleanups */}
      {stats && stats.recent_cleanups.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-xl font-bold text-forest-900">Recent cleanups</h2>
          <div className="mt-4 space-y-3">
            {stats.recent_cleanups.map((cleanup) => (
              <CleanupRow key={cleanup.id} cleanup={cleanup} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Camera; color: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon size={20} />
        </span>
        <div>
          <p className="font-heading text-2xl font-bold text-forest-900">{value}</p>
          <p className="text-xs text-forest-600/70">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ObservationRow({ obs, onDelete }: { obs: Observation; onDelete: (id: number) => void }) {
  const Icon = categoryIcon[obs.category];
  const colors = categoryColors[obs.category];
  const date = new Date(obs.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card card-hover flex items-center gap-4 p-4">
      <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text} ${colors.border} border`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-forest-900">{obs.item_name}</p>
        <p className="text-xs text-forest-600/60">{obs.category}</p>
      </div>
      <div className="hidden flex-shrink-0 items-center gap-1 text-xs text-forest-600/50 sm:flex">
        <Calendar size={12} /> {date}
      </div>
      <button
        onClick={() => onDelete(obs.id)}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-forest-400 transition-colors hover:bg-red-50 hover:text-red-600"
        aria-label="Delete observation"
      >
        <DeleteIcon size={16} />
      </button>
    </div>
  );
}

function CleanupRow({ cleanup }: { cleanup: CleanupActivity }) {
  const date = new Date(cleanup.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700">
        <Trash2 size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-forest-900">{cleanup.description}</p>
        <p className="text-xs text-forest-600/60">{cleanup.items_collected} items collected</p>
      </div>
      <div className="hidden flex-shrink-0 items-center gap-1 text-xs text-forest-600/50 sm:flex">
        <Calendar size={12} /> {date}
      </div>
    </div>
  );
}
