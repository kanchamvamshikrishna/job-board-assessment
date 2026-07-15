package com.globalco.jobboard.config;

import com.globalco.jobboard.model.User;
import com.globalco.jobboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// The job board has exactly one authorized account for posting, editing,
// and deleting jobs. There is no public registration; this seeds that
// account on startup if it doesn't already exist.
//
// The hash default lives here as a Java literal rather than in
// application.properties: Spring's ${VAR:default} placeholder syntax
// re-parses "$" characters inside the default value, which corrupts a
// bcrypt hash (they're full of "$" delimiters) when used that way.
@Component
public class AdminUserSeeder implements CommandLineRunner {

    private static final String DEFAULT_ADMIN_PASSWORD_HASH =
            "$2a$10$d4il7pcsexHPFZ48vPCIg.MqBpT9G/MiXhQN4DJpa1KKvCGTscXOC";

    private final UserRepository userRepository;
    private final String adminEmail;
    private final String adminPasswordHash;

    public AdminUserSeeder(UserRepository userRepository,
                            @Value("${app.admin.email}") String adminEmail,
                            @Value("${ADMIN_PASSWORD_HASH:}") String adminPasswordHashOverride) {
        this.userRepository = userRepository;
        this.adminEmail = adminEmail;
        this.adminPasswordHash = adminPasswordHashOverride.isBlank()
                ? DEFAULT_ADMIN_PASSWORD_HASH
                : adminPasswordHashOverride;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(adminEmail)) {
            userRepository.save(new User(adminEmail, adminPasswordHash));
        }
    }
}
