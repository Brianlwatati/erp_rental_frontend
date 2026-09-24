export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5" aria-busy="true" aria-live="polite">
      <div className="h-7 w-44 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
    </div>
  );
}
