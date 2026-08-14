import type { Feedback } from '@/types';

type DashboardStatsProps = {
  feedback: Feedback[];
};

export default function DashboardStats({ feedback }: DashboardStatsProps) {
  const planned = feedback.filter((f) => f.status === 'planned').length;
  const inProgress = feedback.filter((f) => f.status === 'in_progress').length;
  const completed = feedback.filter((f) => f.status === 'completed').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div className="card text-center">
        <p className="text-3xl font-bold text-primary">{planned}</p>
        <p className="text-sm text-slate-500 mt-1">Planned</p>
      </div>
      <div className="card text-center">
        <p className="text-3xl font-bold text-secondary">{inProgress}</p>
        <p className="text-sm text-slate-500 mt-1">In Progress</p>
      </div>
      <div className="card text-center">
        <p className="text-3xl font-bold text-emerald-600">{completed}</p>
        <p className="text-sm text-slate-500 mt-1">Completed</p>
      </div>
    </div>
  );
}
