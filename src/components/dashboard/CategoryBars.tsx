'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BAR_COLORS = ['#0f766e', '#14b8a6', '#2dd4bf', '#06b6d4', '#0ea5e9', '#38bdf8'];

type CategoryBarsProps = {
  data: { category: string; value: number }[];
  total: number;
};

export default function CategoryBars({ data, total }: CategoryBarsProps) {
  if (total === 0) {
    return (
      <div className="card flex flex-col items-center justify-center text-center py-10">
        <p className="font-semibold">No activity yet</p>
        <p className="text-sm text-slate-500 mt-1">
          Feedback you submit will appear here, grouped by category.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-2">Activity by Category</h3>
      <p className="text-xs text-slate-400 mb-4">Where your tracked solutions live</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="category"
              width={110}
              tick={{ fontSize: 12, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [`${value} solution${value === 1 ? '' : 's'}`, 'Tracked']}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
