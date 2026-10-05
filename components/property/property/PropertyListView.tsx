import Link from "next/link";
import { Property } from "@/types/property";

interface PropertyListViewProps {
  properties: Property[];
}

export default function PropertyListView({
  properties,
}: PropertyListViewProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-3 px-4">Property</th>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {properties.map((prop) => {
              const locationStr = [prop.address, prop.city, prop.county]
                .filter(Boolean)
                .join(", ");

              return (
                <tr
                  key={prop.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {prop.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                    {prop.code || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {locationStr || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/properties/${prop.id}`}
                      className="font-bold text-blue-600 hover:text-blue-700"
                    >
                      View Details &rarr;
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
