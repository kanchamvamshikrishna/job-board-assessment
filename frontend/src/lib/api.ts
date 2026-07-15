import { Job, JobFormValues } from "@/types/job";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? "Request failed");
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

export async function createJob(values: JobFormValues): Promise<Job> {
  const res = await fetch(`${API_BASE_URL}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  return handleResponse<Job>(res);
}
