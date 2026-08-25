export default function SolutionCardSkeleton() {
  return (
    <div className="card block" aria-hidden="true">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-2/3 rounded-full" />
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-1/2 rounded-full" />
      </div>
      <div className="flex items-center gap-2 mt-4">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}
