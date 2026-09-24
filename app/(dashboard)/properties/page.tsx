"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api_client";

interface Property {
  id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  county?: string;
  description?: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Property[]>("/properties")
      .then((res) => setProperties(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-sm text-slate-500">
            Manage real estate assets, buildings, and individual units.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition shadow-sm inline-flex items-center gap-1.5"
        >
          + Add Property
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">
          Loading properties...
        </div>
      ) : properties.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-sm">No properties found.</p>
          <Link
            href="/properties/new"
            className="mt-3 inline-block text-xs font-semibold text-blue-600 hover:underline"
          >
            Create your first property &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-900">
                    {prop.name}
                  </h3>
                  {prop.code && (
                    <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {prop.code}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {[prop.address, prop.city, prop.county]
                    .filter(Boolean)
                    .join(", ") || "No address provided"}
                </p>
                {prop.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {prop.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end items-center text-sm">
                <Link
                  href={`/properties/${prop.id}`}
                  className="text-blue-600 font-semibold text-xs hover:underline"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
