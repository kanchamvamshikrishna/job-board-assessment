import { FormEvent, ReactNode, useState } from "react";
import { ApiError } from "@/lib/api";
import { JOB_TYPE_LABELS, JobFormValues, JobType } from "@/types/job";

interface JobFormProps {
  initialValues: JobFormValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: JobFormValues) => Promise<void>;
}

export default function JobForm({
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
}: JobFormProps) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function update<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setApiError(null);
    setErrors({});

    try {
      await onSubmit(form);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
        if (err.fieldErrors) setErrors(err.fieldErrors);
      } else {
        setApiError(err instanceof Error ? err.message : "Something went wrong");
      }
      setSubmitting(false);
    }
  }

  return (
    <>
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
          className="mt-2 self-start rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </form>
    </>
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
