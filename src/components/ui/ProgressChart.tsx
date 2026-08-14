'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Feedback } from '@/types';

type ProgressChartProps = {
  feedback: Feedback[];
};

export default function ProgressChart({ feedback }: ProgressChartProps) {
  const data = [
    { name: 'Planned', value: feedback.filter((f) => f.status === 'planned').length },
    { name: 'In Progress', value: feedback.filter((f) => f.status === 'in_progress').length },
    { name: 'Completed', value: feedback.filter((f) => f.status === 'completed').length },
  ];

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">Implementation Progress</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
