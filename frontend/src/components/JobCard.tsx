import Link from "next/link";
import { Job, JOB_TYPE_LABELS } from "@/types/job";

function timeAgo(dateString: string): string {
  const posted = new Date(dateString).getTime();
  const diffMs = Date.now() - posted;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          {JOB_TYPE_LABELS[job.type]}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span>{job.location}</span>
        {job.salaryRange && (
          <>
            <span aria-hidden>&middot;</span>
            <span>{job.salaryRange}</span>
          </>
        )}
        <span aria-hidden>&middot;</span>
        <span>{timeAgo(job.postedDate)}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-gray-600">{job.description}</p>
    </Link>
  );
}
