import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JobForm from "@/components/JobForm";
import JobDetailSkeleton from "@/components/JobDetailSkeleton";
import { ApiError, fetchJob, updateJob } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Job, JobFormValues } from "@/types/job";
import NotFoundPage from "./NotFoundPage";

function toFormValues(job: Job): JobFormValues {
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    description: job.description,
    salaryRange: job.salaryRange ?? "",
  };
}

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadJob = useCallback(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setLoadError(null);

    fetchJob(id)
      .then((data) => {
        if (!cancelled) setJob(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(
            err instanceof Error ? err.message : "Could not reach the job board API",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => loadJob(), [loadJob]);

  async function handleSubmit(values: JobFormValues) {
    if (!id || !token) return;
    await updateJob(id, values, token);
    navigate(`/jobs/${id}`, { state: { message: "Job updated successfully." } });
  }

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Could not reach the job board API: {loadError}
        </p>
        <button
          type="button"
          onClick={loadJob}
          className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (notFound || !job) {
    return <NotFoundPage />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Edit job</h1>
      <p className="mt-1 text-sm text-gray-500">Update the details for this listing.</p>

      <JobForm
        initialValues={toFormValues(job)}
        submitLabel="Save Changes"
        submittingLabel="Saving..."
        onSubmit={handleSubmit}
      />
    </div>
  );
}
