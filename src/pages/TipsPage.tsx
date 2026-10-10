import { ecoTips } from '@/data';

export function TipsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-forest-900 sm:text-4xl">Eco Tips</h1>
        <p className="mt-2 text-forest-600/70">
          Practical tips for reducing waste and protecting the environment while exploring outdoors.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {ecoTips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div key={tip.title} className="card card-hover p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700">
                  <Icon size={24} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-forest-900">{tip.title}</h3>
                  <p className="mt-1.5 text-sm text-forest-600/80">{tip.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 card p-6">
        <h3 className="text-lg font-semibold text-forest-900">A note on safety</h3>
        <p className="mt-2 text-sm text-forest-600/80">
          These tips are general guidance and do not replace reliable safety instructions.
          Always follow local waste disposal rules, wear appropriate protective equipment during cleanups,
          and never handle hazardous, medical, or chemical waste yourself. Contact your local waste authority
          for proper collection of dangerous materials.
        </p>
      </div>
    </div>
  );
}
