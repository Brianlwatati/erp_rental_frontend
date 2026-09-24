import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="text-5xl font-bold tracking-tight text-slate-200">404</p>
        <h1 className="mt-3 text-xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The property management page you requested does not exist or may have moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
