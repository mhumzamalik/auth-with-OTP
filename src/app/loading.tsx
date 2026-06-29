import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function Loading(): React.ReactElement {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950"
      aria-label="Loading page…"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Brand mark */}
        <div className="grid grid-cols-2 gap-1.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: "#7B1F4B" }}
            />
          ))}
        </div>
        <LoadingSpinner size={28} label="Loading page…" />
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading…</p>
      </div>
    </div>
  );
}
