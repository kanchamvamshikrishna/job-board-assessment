package com.globalco.jobboard.config;

import com.globalco.jobboard.model.User;
import com.globalco.jobboard.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserSeederTest {

    @Mock
    private UserRepository userRepository;

    private AdminUserSeeder seeder;

    @BeforeEach
    void setUp() {
        seeder = new AdminUserSeeder(userRepository, "kancham@gmail.com", "hashed-password");
    }

    @Test
    void run_createsAdminUser_whenNotAlreadyPresent() throws Exception {
        when(userRepository.existsByEmail("kancham@gmail.com")).thenReturn(false);

        seeder.run();

        verify(userRepository).save(any(User.class));
    }

    @Test
    void run_doesNothing_whenAdminAlreadyExists() throws Exception {
        when(userRepository.existsByEmail("kancham@gmail.com")).thenReturn(true);

        seeder.run();

        verify(userRepository, never()).save(any(User.class));
    }
}
