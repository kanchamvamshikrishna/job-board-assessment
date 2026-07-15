import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import JobCard from "@/components/JobCard";
import JobCardSkeleton from "@/components/JobCardSkeleton";
import { fetchJobs } from "@/lib/api";
import { Job } from "@/types/job";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (routerLocation.state as { message?: string } | null)?.message ?? null,
  );

  const keyword = searchParams.get("keyword") ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const hasActiveFilters = Boolean(keyword || location || type);

  useEffect(() => {
    fetchJobs()
      .then((data) => setTotalCount(data.length))
      .catch(() => setTotalCount(null));
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    navigate(routerLocation.pathname + routerLocation.search, { replace: true, state: {} });
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadJobs = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchJobs({ keyword, location, type })
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load jobs");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [keyword, location, type]);

  useEffect(() => loadJobs(), [loadJobs]);

  return (
    <div>
      {successMessage && (
        <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </p>
      )}

      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Find your next role</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse open positions across Globalco and partner companies.
        </p>
      </div>
      <SearchBar />

      {!loading && !error && (
        <p className="mt-4 text-sm text-gray-500">
          {hasActiveFilters
            ? `Showing ${jobs.length} of ${totalCount ?? "…"} job${totalCount === 1 ? "" : "s"} matching your search`
            : `${totalCount ?? jobs.length} job${(totalCount ?? jobs.length) === 1 ? "" : "s"} available`}
        </p>
      )}

      {loading && (
        <div className="mt-6 grid gap-4">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">Could not reach the job board API: {error}</p>
          <button
            type="button"
            onClick={loadJobs}
            className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <p className="mt-8 rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No jobs found. Try adjusting your search, or be the first to post one.
        </p>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="mt-6 grid gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
