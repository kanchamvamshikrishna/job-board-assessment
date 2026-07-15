import { Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import JobCard from "@/components/JobCard";
import { fetchJobs } from "@/lib/api";
import { Job } from "@/types/job";

interface HomePageProps {
  searchParams: { keyword?: string; location?: string; type?: string };
}

async function JobList({ searchParams }: HomePageProps) {
  let jobs: Job[];
  let error: string | null = null;

  try {
    jobs = await fetchJobs(searchParams);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load jobs";
    jobs = [];
  }

  if (error) {
    return (
      <p className="mt-8 rounded-md bg-red-50 p-4 text-sm text-red-700">
        Could not reach the job board API: {error}
      </p>
    );
  }

  if (jobs.length === 0) {
    return (
      <p className="mt-8 rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        No jobs found. Try adjusting your search, or be the first to post one.
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Find your next role</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse open positions across Globalco and partner companies.
        </p>
      </div>
      <Suspense>
        <SearchBar />
      </Suspense>
      <Suspense fallback={<p className="mt-8 text-sm text-gray-500">Loading jobs...</p>}>
        <JobList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
