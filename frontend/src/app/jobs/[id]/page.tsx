import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJob } from "@/lib/api";
import { JOB_TYPE_LABELS } from "@/types/job";

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  let job;
  try {
    job = await fetchJob(params.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm text-brand-600 hover:underline">
        &larr; Back to all jobs
      </Link>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="mt-1 text-gray-600">{job.company}</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {JOB_TYPE_LABELS[job.type]}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
          <span>{job.location}</span>
          {job.salaryRange && <span>{job.salaryRange}</span>}
          <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
        </div>

        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
        <p className="mt-2 whitespace-pre-line text-gray-700">{job.description}</p>
      </div>
    </div>
  );
}
