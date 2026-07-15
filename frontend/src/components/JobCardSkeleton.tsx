export default function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="w-2/3">
          <div className="h-5 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-1/2 rounded bg-gray-100" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-100" />
      </div>
      <div className="mt-4 flex gap-3">
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-3 w-16 rounded bg-gray-100" />
        <div className="h-3 w-14 rounded bg-gray-100" />
      </div>
      <div className="mt-4 h-3 w-full rounded bg-gray-100" />
      <div className="mt-2 h-3 w-5/6 rounded bg-gray-100" />
    </div>
  );
}
