import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { isAuthenticated, email, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

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

          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <span className="text-sm text-gray-600">{email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-brand-600"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-brand-600">
                Log In
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
