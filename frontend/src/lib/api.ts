import { Job, JobFormValues } from "@/types/job";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? "Request failed", body.fieldErrors);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  type?: string;
}

export async function fetchJobs(params: JobSearchParams = {}): Promise<Job[]> {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.location) query.set("location", params.location);
  if (params.type) query.set("type", params.type);

  const res = await fetch(`${API_BASE_URL}/api/jobs?${query.toString()}`, {
    cache: "no-store",
  });
  return handleResponse<Job[]>(res);
}

export async function fetchJob(id: string | number): Promise<Job> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, { cache: "no-store" });
  return handleResponse<Job>(res);
}

export async function createJob(values: JobFormValues, token: string): Promise<Job> {
  const res = await fetch(`${API_BASE_URL}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(values),
  });
  return handleResponse<Job>(res);
}

export async function updateJob(
  id: string | number,
  values: JobFormValues,
  token: string,
): Promise<Job> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(values),
  });
  return handleResponse<Job>(res);
}

export async function deleteJob(id: string | number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<void>(res);
}

export interface BulkUploadRowError {
  row: number;
  message: string;
}

export interface BulkUploadResult {
  createdCount: number;
  createdJobs: Job[];
  errors: BulkUploadRowError[];
}

export async function bulkUploadJobs(file: File, token: string): Promise<BulkUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/jobs/bulk-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse<BulkUploadResult>(res);
}

export interface AuthResponse {
  token: string;
  email: string;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}
