package com.globalco.jobboard.repository;

import com.globalco.jobboard.model.Job;
import com.globalco.jobboard.model.JobType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("SELECT j FROM Job j WHERE " +
            "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "  OR LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "  OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND (:type IS NULL OR j.type = :type) " +
            "ORDER BY j.postedDate DESC")
    List<Job> search(@Param("keyword") String keyword,
                      @Param("location") String location,
                      @Param("type") JobType type);
}
