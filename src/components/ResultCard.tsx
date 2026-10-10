import type { AnalysisResult } from '@/types';
import { categoryColors, categoryIcon, confidenceColors } from '@/data';
import { ShieldAlert, Trash2, Info, CheckCircle2 } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
}

export function ResultCard({ result, onSave, saving, saved }: ResultCardProps) {
  const Icon = categoryIcon[result.category];
  const colors = categoryColors[result.category];

  return (
    <div className="card p-6 animate-fade-up">
      {/* Category header */}
      <div className="flex items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.text} ${colors.border} border`}>
            <Icon size={24} />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-forest-600/60">
              Waste category
            </p>
            <h3 className="text-lg font-semibold text-forest-900">{result.category}</h3>
          </div>
        </div>
        <span className={`badge ${confidenceColors[result.confidence] || 'bg-gray-100 text-gray-700'}`}>
          {result.confidence}
        </span>
      </div>

      <div className="border-t border-sand-200/60 pt-4">
        <h4 className="font-heading text-base font-semibold text-forest-900">{result.item_name}</h4>
        <p className="mt-1 text-sm text-forest-600/80">{result.explanation}</p>
      </div>

      {/* Three guidance sections */}
      <div className="mt-5 space-y-4">
        <GuidanceSection
          icon={Info}
          color="text-sky-700 bg-sky-50"
          title="What is it?"
          text={`The image appears to show ${result.item_name.toLowerCase()}, which falls under the ${result.category.toLowerCase()} category.`}
        />
        <GuidanceSection
          icon={Trash2}
          color="text-leaf-700 bg-leaf-50"
          title="What should I do?"
          text={result.disposal_action}
        />
        <GuidanceSection
          icon={ShieldAlert}
          color="text-earth-700 bg-earth-50"
          title="Stay safe"
          text={result.safety_warnings || 'No specific safety concerns identified for this item.'}
        />
      </div>

      {result.needs_professional && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <ShieldAlert size={18} className="mt-0.5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-900">
            This item should be handled by a professional or authorised waste collection service. Do not attempt to process it yourself.
          </p>
        </div>
      )}

      {onSave && (
        <div className="mt-6 flex justify-end">
          {saved ? (
            <span className="flex items-center gap-2 text-sm font-medium text-leaf-700">
              <CheckCircle2 size={18} />
              Saved to your activity
            </span>
          ) : (
            <button onClick={onSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save observation'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function GuidanceSection({
  icon: Icon,
  color,
  title,
  text,
}: {
  icon: typeof Info;
  color: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon size={16} />
      </span>
      <div>
        <p className="text-sm font-semibold text-forest-900">{title}</p>
        <p className="mt-0.5 text-sm text-forest-600/80">{text}</p>
      </div>
    </div>
  );
}
