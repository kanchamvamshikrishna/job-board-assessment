import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-brand-700">
          Globalco Job Board
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-brand-600">
            Browse Jobs
          </Link>
          <Link
            to="/jobs/bulk-upload"
            className="text-sm font-medium text-gray-600 hover:text-brand-600"
          >
            Bulk Upload
          </Link>
          <Link
            to="/jobs/new"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Post a Job
          </Link>
        </nav>
      </div>
    </header>
  );
}
