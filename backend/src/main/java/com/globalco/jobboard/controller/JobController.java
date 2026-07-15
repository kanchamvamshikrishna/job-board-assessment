package com.globalco.jobboard.controller;

import com.globalco.jobboard.dto.BulkUploadResult;
import com.globalco.jobboard.dto.JobRequest;
import com.globalco.jobboard.model.Job;
import com.globalco.jobboard.model.JobType;
import com.globalco.jobboard.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public List<Job> getJobs(@RequestParam(required = false) String keyword,
                              @RequestParam(required = false) String location,
                              @RequestParam(required = false) JobType type) {
        return jobService.searchJobs(keyword, location, type);
    }

    @GetMapping("/{id}")
    public Job getJob(@PathVariable Long id) {
        return jobService.getJob(id);
    }

    @PostMapping
    public ResponseEntity<Job> createJob(@Valid @RequestBody JobRequest request) {
        Job created = jobService.createJob(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public Job updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest request) {
        return jobService.updateJob(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BulkUploadResult> bulkUpload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        BulkUploadResult result = jobService.bulkUploadJobs(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
}
