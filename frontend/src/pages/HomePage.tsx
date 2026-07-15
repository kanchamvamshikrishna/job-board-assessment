import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import JobCard from "@/components/JobCard";
import { fetchJobs } from "@/lib/api";
import { Job } from "@/types/job";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const keyword = searchParams.get("keyword") ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const type = searchParams.get("type") ?? undefined;

  useEffect(() => {
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

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Find your next role</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse open positions across Globalco and partner companies.
        </p>
      </div>
      <SearchBar />

      {loading && <p className="mt-8 text-sm text-gray-500">Loading jobs...</p>}

      {!loading && error && (
        <p className="mt-8 rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not reach the job board API: {error}
        </p>
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
