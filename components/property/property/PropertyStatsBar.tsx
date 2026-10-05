interface PropertyStatsBarProps {
  totalAssets: number;
  uniqueCities: number;
}

export default function PropertyStatsBar({
  totalAssets,
  uniqueCities,
}: PropertyStatsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {/* Total Assets */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9m4 0V7m0 0h4m-4 0H9"
            />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Assets
          </p>
          <p className="text-lg font-bold text-slate-900 leading-none mt-0.5">
            {totalAssets}
          </p>
        </div>
      </div>

      {/* Locations */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Locations
          </p>
          <p className="text-lg font-bold text-slate-900 leading-none mt-0.5">
            {uniqueCities} {uniqueCities === 1 ? "City" : "Cities"}
          </p>
        </div>
      </div>

      {/* Active Status */}
      <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Status
          </p>
          <p className="text-lg font-bold text-slate-900 leading-none mt-0.5">
            100% Operational
          </p>
        </div>
      </div>
    </div>
  );
}
