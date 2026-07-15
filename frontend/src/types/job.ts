export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "REMOTE";

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: JobType;
  description: string;
  salaryRange?: string;
  postedDate: string;
}

export interface JobFormValues {
  title: string;
  company: string;
  location: string;
  type: JobType;
  description: string;
  salaryRange?: string;
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
};
