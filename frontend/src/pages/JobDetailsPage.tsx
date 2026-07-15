import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError, deleteJob, fetchJob } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Job, JOB_TYPE_LABELS } from "@/types/job";
import JobDetailSkeleton from "@/components/JobDetailSkeleton";
import NotFoundPage from "./NotFoundPage";

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  );

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

  useEffect(() => {
    if (!successMessage) return;
    navigate(location.pathname, { replace: true, state: {} });
    const timer = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
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

  async function handleDelete() {
    if (!id || !token) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteJob(id, token);
      navigate("/", { state: { message: "Job deleted successfully." } });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete job");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {successMessage && (
        <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm text-brand-600 hover:underline">
          &larr; Back to all jobs
        </Link>

        {!isAuthenticated ? null : !confirmingDelete ? (
          <div className="flex gap-2">
            <Link
              to={`/jobs/${job.id}/edit`}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-1.5">
            <span className="text-sm text-red-700">Delete this listing?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="rounded-md px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {deleteError && (
        <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{deleteError}</p>
      )}

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
