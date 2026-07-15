import { Route, Routes } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RequireAuth from "@/components/RequireAuth";
import { AuthProvider } from "@/lib/AuthContext";
import HomePage from "@/pages/HomePage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import PostJobPage from "@/pages/PostJobPage";
import EditJobPage from "@/pages/EditJobPage";
import BulkUploadPage from "@/pages/BulkUploadPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/jobs/new"
            element={
              <RequireAuth>
                <PostJobPage />
              </RequireAuth>
            }
          />
          <Route
            path="/jobs/bulk-upload"
            element={
              <RequireAuth>
                <BulkUploadPage />
              </RequireAuth>
            }
          />
          <Route
            path="/jobs/:id/edit"
            element={
              <RequireAuth>
                <EditJobPage />
              </RequireAuth>
            }
          />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
