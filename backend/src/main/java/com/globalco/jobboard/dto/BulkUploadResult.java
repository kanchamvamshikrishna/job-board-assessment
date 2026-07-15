package com.globalco.jobboard.dto;

import com.globalco.jobboard.model.Job;

import java.util.List;

public class BulkUploadResult {

    private final int createdCount;
    private final List<Job> createdJobs;
    private final List<RowError> errors;

    public BulkUploadResult(List<Job> createdJobs, List<RowError> errors) {
        this.createdCount = createdJobs.size();
        this.createdJobs = createdJobs;
        this.errors = errors;
    }

    public int getCreatedCount() {
        return createdCount;
    }

    public List<Job> getCreatedJobs() {
        return createdJobs;
    }

    public List<RowError> getErrors() {
        return errors;
    }

    public static class RowError {
        private final int row;
        private final String message;

        public RowError(int row, String message) {
            this.row = row;
            this.message = message;
        }

        public int getRow() {
            return row;
        }

        public String getMessage() {
            return message;
        }
    }
}
