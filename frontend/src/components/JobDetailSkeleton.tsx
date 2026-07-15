export default function JobDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="h-4 w-28 rounded bg-gray-100" />
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="w-2/3">
            <div className="h-7 w-3/4 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-1/2 rounded bg-gray-100" />
          </div>
          <div className="h-6 w-20 rounded-full bg-gray-100" />
        </div>
        <div className="mt-4 flex gap-4">
          <div className="h-3 w-24 rounded bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="h-3 w-28 rounded bg-gray-100" />
        </div>
        <hr className="my-6 border-gray-200" />
        <div className="h-5 w-40 rounded bg-gray-200" />
        <div className="mt-3 h-3 w-full rounded bg-gray-100" />
        <div className="mt-2 h-3 w-full rounded bg-gray-100" />
        <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
      </div>
    </div>
  );
}
