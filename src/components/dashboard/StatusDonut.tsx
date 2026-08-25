'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_META: Record<string, { color: string; label: string }> = {
  planned: { color: '#94a3b8', label: 'Planned' },
  in_progress: { color: '#14b8a6', label: 'In progress' },
  completed: { color: '#10b981', label: 'Completed' },
};

type StatusDonutProps = {
  counts: { status: string; value: number }[];
  total: number;
};

export default function StatusDonut({ counts, total }: StatusDonutProps) {
  if (total === 0) {
    return (
      <div className="card flex flex-col items-center justify-center text-center py-10">
        <p className="font-semibold">No tracked solutions yet</p>
        <p className="text-sm text-slate-500 mt-1">Track a solution to see your progress chart.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-2">Progress by Status</h3>
      <p className="text-xs text-slate-400 mb-4">Your tracked solutions, by implementation stage</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={counts}
              dataKey="value"
              nameKey="status"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              strokeWidth={0}
            >
              {counts.map((c) => (
                <Cell key={c.status} fill={STATUS_META[c.status]?.color ?? '#cbd5e1'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} solution${value === 1 ? '' : 's'}`,
                STATUS_META[name]?.label ?? name,
              ]}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Legend
              formatter={(value: string) => STATUS_META[value]?.label ?? value}
              iconType="circle"
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
