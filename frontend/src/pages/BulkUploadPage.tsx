import { ChangeEvent, FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, BulkUploadResult, bulkUploadJobs } from "@/lib/api";

const SAMPLE_CSV = `title,company,location,type,description,salaryRange
Senior Backend Engineer,Globalco,Hyderabad,FULL_TIME,Design and build REST APIs for the job board platform.,18-25 LPA
Product Designer,Globalco,Remote,CONTRACT,Own the end-to-end design process for new features.,10-15 LPA
`;

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "jobs-sample.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setResult(null);
    setApiError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;

    setSubmitting(true);
    setApiError(null);
    setResult(null);

    try {
      const uploadResult = await bulkUploadJobs(file);
      setResult(uploadResult);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : "Failed to upload jobs");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Bulk upload jobs</h1>
      <p className="mt-1 text-sm text-gray-500">
        Upload a CSV file to create multiple job listings at once.
      </p>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-900">CSV format</p>
        <p className="mt-1">
          Required columns: <code className="rounded bg-gray-100 px-1 py-0.5">title</code>,{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">company</code>,{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">location</code>,{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">type</code>,{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">description</code>. Optional:{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">salaryRange</code>.
        </p>
        <p className="mt-1">
          <code className="rounded bg-gray-100 px-1 py-0.5">type</code> must be one of FULL_TIME,
          PART_TIME, CONTRACT, INTERNSHIP, REMOTE.
        </p>
        <button
          type="button"
          onClick={downloadSampleCsv}
          className="mt-3 text-brand-600 hover:underline"
        >
          Download sample CSV
        </button>
      </div>

      {apiError && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{apiError}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="input"
        />
        <button
          type="submit"
          disabled={!file || submitting}
          className="self-start rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? "Uploading..." : "Upload jobs"}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-900">
            Created {result.createdCount} job{result.createdCount === 1 ? "" : "s"}
            {result.errors.length > 0 && `, ${result.errors.length} row${result.errors.length === 1 ? "" : "s"} skipped`}
          </p>

          {result.createdJobs.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-gray-600">
              {result.createdJobs.map((job) => (
                <li key={job.id}>
                  <Link to={`/jobs/${job.id}`} className="text-brand-600 hover:underline">
                    {job.title}
                  </Link>{" "}
                  &middot; {job.company}
                </li>
              ))}
            </ul>
          )}

          {result.errors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-red-700">Rows skipped</p>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-red-600">
                {result.errors.map((error) => (
                  <li key={error.row}>
                    Row {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
