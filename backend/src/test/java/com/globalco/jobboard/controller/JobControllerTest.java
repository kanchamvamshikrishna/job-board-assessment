package com.globalco.jobboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globalco.jobboard.dto.BulkUploadResult;
import com.globalco.jobboard.dto.JobRequest;
import com.globalco.jobboard.exception.JobNotFoundException;
import com.globalco.jobboard.model.Job;
import com.globalco.jobboard.model.JobType;
import com.globalco.jobboard.service.JobService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobController.class)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JobService jobService;

    private Job sampleJob() {
        Job job = new Job("Backend Engineer", "Globalco", "Hyderabad",
                JobType.FULL_TIME, "Build APIs", "10-15 LPA");
        job.setId(1L);
        return job;
    }

    @Test
    void getJobs_returnsList() throws Exception {
        when(jobService.searchJobs(isNull(), isNull(), isNull()))
                .thenReturn(List.of(sampleJob()));

        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Backend Engineer"));
    }

    @Test
    void getJob_returnsJob_whenFound() throws Exception {
        when(jobService.getJob(1L)).thenReturn(sampleJob());

        mockMvc.perform(get("/api/jobs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Globalco"));
    }

    @Test
    void getJob_returns404_whenMissing() throws Exception {
        when(jobService.getJob(99L)).thenThrow(new JobNotFoundException(99L));

        mockMvc.perform(get("/api/jobs/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Job not found with id: 99"));
    }

    @Test
    void createJob_returns201_whenValid() throws Exception {
        JobRequest request = new JobRequest();
        request.setTitle("Backend Engineer");
        request.setCompany("Globalco");
        request.setLocation("Hyderabad");
        request.setType(JobType.FULL_TIME);
        request.setDescription("Build APIs");
        request.setSalaryRange("10-15 LPA");

        when(jobService.createJob(any(JobRequest.class))).thenReturn(sampleJob());

        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void createJob_returns400_whenMissingRequiredFields() throws Exception {
        JobRequest request = new JobRequest();
        request.setTitle("");

        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.title").exists());
    }

    @Test
    void deleteJob_returns204() throws Exception {
        mockMvc.perform(delete("/api/jobs/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void bulkUpload_returns201_withSummary() throws Exception {
        BulkUploadResult result = new BulkUploadResult(
                List.of(sampleJob()),
                List.of(new BulkUploadResult.RowError(3, "title: Title is required")));
        when(jobService.bulkUploadJobs(any())).thenReturn(result);

        MockMultipartFile file = new MockMultipartFile(
                "file", "jobs.csv", "text/csv", "title,company\n".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/jobs/bulk-upload").file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.createdCount").value(1))
                .andExpect(jsonPath("$.errors[0].row").value(3));
    }

    @Test
    void bulkUpload_returns400_whenFileEmpty() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "jobs.csv", "text/csv", new byte[0]);

        mockMvc.perform(multipart("/api/jobs/bulk-upload").file(file))
                .andExpect(status().isBadRequest());
    }
}
