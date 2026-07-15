import { Route, Routes } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import PostJobPage from "@/pages/PostJobPage";
import BulkUploadPage from "@/pages/BulkUploadPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs/new" element={<PostJobPage />} />
          <Route path="/jobs/bulk-upload" element={<BulkUploadPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
