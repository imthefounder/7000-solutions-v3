import type { ReactNode } from 'react';

type ImpactCardProps = {
  icon: ReactNode;
  value: string | number;
  label: string;
  hint?: string;
  grad?: string;
};

export default function ImpactCard({
  icon,
  value,
  label,
  hint,
  grad = 'from-teal-600 to-cyan-500',
}: ImpactCardProps) {
  return (
    <div className="card relative overflow-hidden">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md shrink-0`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-bold font-[var(--font-display)] leading-none">{value}</p>
          <p className="text-sm text-slate-500 mt-1">{label}</p>
          {hint && <p className="text-xs text-slate-400 mt-0.5 truncate">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
