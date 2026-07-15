package com.globalco.jobboard.service;

import com.globalco.jobboard.dto.JobRequest;
import com.globalco.jobboard.exception.JobNotFoundException;
import com.globalco.jobboard.model.Job;
import com.globalco.jobboard.model.JobType;
import com.globalco.jobboard.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    private Job sampleJob;

    @BeforeEach
    void setUp() {
        sampleJob = new Job("Backend Engineer", "Globalco", "Hyderabad",
                JobType.FULL_TIME, "Build APIs", "10-15 LPA");
        sampleJob.setId(1L);
    }

    @Test
    void getJob_returnsJob_whenFound() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(sampleJob));

        Job result = jobService.getJob(1L);

        assertThat(result.getTitle()).isEqualTo("Backend Engineer");
    }

    @Test
    void getJob_throwsNotFound_whenMissing() {
        when(jobRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobService.getJob(99L))
                .isInstanceOf(JobNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void createJob_savesAndReturnsJob() {
        JobRequest request = new JobRequest();
        request.setTitle("Frontend Engineer");
        request.setCompany("Globalco");
        request.setLocation("Remote");
        request.setType(JobType.REMOTE);
        request.setDescription("Build UIs");
        request.setSalaryRange("8-12 LPA");

        when(jobRepository.save(any(Job.class))).thenAnswer(inv -> {
            Job j = inv.getArgument(0);
            j.setId(2L);
            return j;
        });

        Job result = jobService.createJob(request);

        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getTitle()).isEqualTo("Frontend Engineer");
        verify(jobRepository, times(1)).save(any(Job.class));
    }

    @Test
    void updateJob_updatesFields() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(sampleJob));
        when(jobRepository.save(any(Job.class))).thenAnswer(inv -> inv.getArgument(0));

        JobRequest request = new JobRequest();
        request.setTitle("Senior Backend Engineer");
        request.setCompany("Globalco");
        request.setLocation("Hyderabad");
        request.setType(JobType.FULL_TIME);
        request.setDescription("Lead API design");
        request.setSalaryRange("18-25 LPA");

        Job result = jobService.updateJob(1L, request);

        assertThat(result.getTitle()).isEqualTo("Senior Backend Engineer");
        assertThat(result.getSalaryRange()).isEqualTo("18-25 LPA");
    }

    @Test
    void deleteJob_removesJob_whenFound() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(sampleJob));

        jobService.deleteJob(1L);

        verify(jobRepository, times(1)).delete(sampleJob);
    }

    @Test
    void searchJobs_passesTrimmedKeyword_toRepository() {
        when(jobRepository.search(eq("engineer"), eq(null), eq(JobType.FULL_TIME)))
                .thenReturn(List.of(sampleJob));

        List<Job> results = jobService.searchJobs("  engineer  ", "", JobType.FULL_TIME);

        assertThat(results).hasSize(1);
        verify(jobRepository).search("engineer", null, JobType.FULL_TIME);
    }
}
