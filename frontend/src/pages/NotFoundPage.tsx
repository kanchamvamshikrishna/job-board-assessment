import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>
      <p className="mt-2 text-gray-500">This listing may have been removed or never existed.</p>
      <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline">
        &larr; Back to all jobs
      </Link>
    </div>
  );
}
