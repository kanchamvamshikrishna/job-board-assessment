package com.globalco.jobboard.service;

import com.globalco.jobboard.dto.BulkUploadResult;
import com.globalco.jobboard.dto.JobRequest;
import com.globalco.jobboard.exception.JobNotFoundException;
import com.globalco.jobboard.model.Job;
import com.globalco.jobboard.model.JobType;
import com.globalco.jobboard.repository.JobRepository;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final Validator validator;

    public JobService(JobRepository jobRepository, Validator validator) {
        this.jobRepository = jobRepository;
        this.validator = validator;
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

    public BulkUploadResult bulkUploadJobs(MultipartFile file) {
        List<Job> created = new ArrayList<>();
        List<BulkUploadResult.RowError> errors = new ArrayList<>();

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CSVParser parser = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setTrim(true)
                    .setIgnoreSurroundingSpaces(true)
                    .build()
                    .parse(reader);

            for (CSVRecord record : parser) {
                // +2: 1-indexed, plus the header row itself
                int rowNum = (int) record.getRecordNumber() + 1;
                try {
                    JobRequest request = mapRow(record);
                    Set<ConstraintViolation<JobRequest>> violations = validator.validate(request);
                    if (!violations.isEmpty()) {
                        String message = violations.stream()
                                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                                .collect(Collectors.joining("; "));
                        errors.add(new BulkUploadResult.RowError(rowNum, message));
                        continue;
                    }
                    created.add(createJob(request));
                } catch (IllegalArgumentException e) {
                    errors.add(new BulkUploadResult.RowError(rowNum, "Invalid job type"));
                }
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not read the uploaded file: " + e.getMessage(), e);
        }

        return new BulkUploadResult(created, errors);
    }

    private JobRequest mapRow(CSVRecord record) {
        JobRequest request = new JobRequest();
        request.setTitle(getField(record, "title"));
        request.setCompany(getField(record, "company"));
        request.setLocation(getField(record, "location"));

        String typeValue = getField(record, "type");
        request.setType(typeValue == null ? null : JobType.valueOf(typeValue.trim().toUpperCase()));

        request.setDescription(getField(record, "description"));
        request.setSalaryRange(getField(record, "salaryRange"));
        return request;
    }

    private String getField(CSVRecord record, String column) {
        if (!record.isMapped(column)) {
            return null;
        }
        String value = record.get(column);
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
