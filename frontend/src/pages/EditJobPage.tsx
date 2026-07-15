import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JobForm from "@/components/JobForm";
import { fetchJob, updateJob } from "@/lib/api";
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
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetchJob(id)
      .then((data) => {
        if (!cancelled) setJob(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(values: JobFormValues) {
    if (!id) return;
    await updateJob(id, values);
    navigate(`/jobs/${id}`);
  }

  if (loading) {
    return <p className="mt-8 text-sm text-gray-500">Loading job...</p>;
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
