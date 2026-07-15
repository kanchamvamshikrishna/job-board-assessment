package com.globalco.jobboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globalco.jobboard.config.CorsConfig;
import com.globalco.jobboard.config.SecurityConfig;
import com.globalco.jobboard.dto.JobRequest;
import com.globalco.jobboard.model.Job;
import com.globalco.jobboard.model.JobType;
import com.globalco.jobboard.service.JobService;
import com.globalco.jobboard.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Verifies the actual security boundary: unauthenticated writes are
// rejected, authenticated writes succeed, reads stay public. Business logic
// itself is covered by JobControllerTest (filters disabled there).
@WebMvcTest(JobController.class)
@Import({SecurityConfig.class, CorsConfig.class})
class JobControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JobService jobService;

    @MockBean
    private JwtService jwtService;

    private JobRequest sampleRequest() {
        JobRequest request = new JobRequest();
        request.setTitle("Backend Engineer");
        request.setCompany("Globalco");
        request.setLocation("Hyderabad");
        request.setType(JobType.FULL_TIME);
        request.setDescription("Build APIs");
        return request;
    }

    @Test
    void createJob_returns401_withoutToken() throws Exception {
        mockMvc.perform(post("/api/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createJob_returns401_withInvalidToken() throws Exception {
        when(jwtService.isValid("bad-token")).thenReturn(false);

        mockMvc.perform(post("/api/jobs")
                        .header("Authorization", "Bearer bad-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createJob_returns201_withValidToken() throws Exception {
        when(jwtService.isValid("valid-token")).thenReturn(true);
        when(jwtService.extractEmail("valid-token")).thenReturn("test@example.com");

        Job created = new Job("Backend Engineer", "Globalco", "Hyderabad",
                JobType.FULL_TIME, "Build APIs", null);
        created.setId(1L);
        when(jobService.createJob(any(JobRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/jobs")
                        .header("Authorization", "Bearer valid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequest())))
                .andExpect(status().isCreated());
    }

    @Test
    void getJobs_publiclyAccessible_withoutToken() throws Exception {
        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk());
    }
}
