import { useNavigate } from "react-router-dom";
import JobForm from "@/components/JobForm";
import { createJob } from "@/lib/api";
import { JobFormValues, JobType } from "@/types/job";

const emptyForm: JobFormValues = {
  title: "",
  company: "",
  location: "",
  type: "FULL_TIME" as JobType,
  description: "",
  salaryRange: "",
};

export default function PostJobPage() {
  const navigate = useNavigate();

  async function handleSubmit(values: JobFormValues) {
    const job = await createJob(values);
    navigate(`/jobs/${job.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Post a new job</h1>
      <p className="mt-1 text-sm text-gray-500">
        Fill in the details below to publish a listing on the job board.
      </p>

      <JobForm
        initialValues={emptyForm}
        submitLabel="Post Job"
        submittingLabel="Posting..."
        onSubmit={handleSubmit}
      />
    </div>
  );
}
