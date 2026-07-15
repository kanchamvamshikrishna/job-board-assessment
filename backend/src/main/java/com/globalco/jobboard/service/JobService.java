package com.globalco.jobboard.service;

import com.globalco.jobboard.dto.JobRequest;
import com.globalco.jobboard.exception.JobNotFoundException;
import com.globalco.jobboard.model.Job;
import com.globalco.jobboard.model.JobType;
import com.globalco.jobboard.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public List<Job> searchJobs(String keyword, String location, JobType type) {
        return jobRepository.search(blankToNull(keyword), blankToNull(location), type);
    }

    public Job getJob(Long id) {
        return jobRepository.findById(id).orElseThrow(() -> new JobNotFoundException(id));
    }

    public Job createJob(JobRequest request) {
        Job job = new Job(request.getTitle(), request.getCompany(), request.getLocation(),
                request.getType(), request.getDescription(), request.getSalaryRange());
        return jobRepository.save(job);
    }

    public Job updateJob(Long id, JobRequest request) {
        Job job = getJob(id);
        job.setTitle(request.getTitle());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setType(request.getType());
        job.setDescription(request.getDescription());
        job.setSalaryRange(request.getSalaryRange());
        return jobRepository.save(job);
    }

    public void deleteJob(Long id) {
        Job job = getJob(id);
        jobRepository.delete(job);
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
