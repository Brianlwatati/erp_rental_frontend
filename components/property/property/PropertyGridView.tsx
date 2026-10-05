import Link from "next/link";
import { Property } from "@/types/property";

interface PropertyGridViewProps {
  properties: Property[];
}

export default function PropertyGridView({
  properties,
}: PropertyGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {properties.map((prop) => {
        const locationStr = [prop.address, prop.city, prop.county]
          .filter(Boolean)
          .join(", ");

        return (
          <div
            key={prop.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
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
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {prop.name}
                    </h3>
                    {prop.code && (
                      <span className="inline-block font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-0.5">
                        {prop.code}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-1.5 text-xs text-slate-500 pt-1">
                <svg
                  className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="line-clamp-1">
                  {locationStr || "No address specified"}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-8">
                {prop.description ||
                  "No description available for this property asset."}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-[11px] font-semibold text-slate-400">
                {prop.property_type || "Property Asset"}
              </span>

              <Link
                href={`/properties/${prop.id}`}
                className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 transition group/link"
              >
                View Details
                <svg
                  className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
