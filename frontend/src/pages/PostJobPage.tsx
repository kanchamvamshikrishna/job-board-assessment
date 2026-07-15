import { FormEvent, ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, createJob } from "@/lib/api";
import { JOB_TYPE_LABELS, JobType } from "@/types/job";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  type: "FULL_TIME" as JobType,
  description: "",
  salaryRange: "",
};

export default function PostJobPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setApiError(null);
    setErrors({});

    try {
      const job = await createJob(form);
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
        if (err.fieldErrors) setErrors(err.fieldErrors);
      } else {
        setApiError(err instanceof Error ? err.message : "Failed to post job");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Post a new job</h1>
      <p className="mt-1 text-sm text-gray-500">
        Fill in the details below to publish a listing on the job board.
      </p>

      {apiError && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{apiError}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="Job Title" error={errors.title}>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="input"
            placeholder="e.g. Senior Backend Engineer"
          />
        </Field>

        <Field label="Company" error={errors.company}>
          <input
            required
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            className="input"
            placeholder="e.g. Globalco"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Location" error={errors.location}>
            <input
              required
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className="input"
              placeholder="e.g. Hyderabad, India"
            />
          </Field>

          <Field label="Job Type">
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value as JobType)}
              className="input"
            >
              {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Salary Range (optional)">
          <input
            value={form.salaryRange}
            onChange={(e) => update("salaryRange", e.target.value)}
            className="input"
            placeholder="e.g. 10-15 LPA"
          />
        </Field>

        <Field label="Description" error={errors.description}>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="input"
            placeholder="Responsibilities, requirements, benefits..."
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      {label}
      {children}
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}
