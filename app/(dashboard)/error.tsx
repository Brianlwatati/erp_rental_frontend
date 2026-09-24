"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center">
      <div className="w-full rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Something went wrong</p>
        <h1 className="mt-2 text-xl font-bold text-slate-900">We could not load this page.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Please try again. If the problem continues, check the API connection and application logs.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
