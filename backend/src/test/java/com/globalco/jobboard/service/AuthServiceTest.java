package com.globalco.jobboard.service;

import com.globalco.jobboard.dto.AuthRequest;
import com.globalco.jobboard.dto.AuthResponse;
import com.globalco.jobboard.exception.EmailAlreadyInUseException;
import com.globalco.jobboard.exception.InvalidCredentialsException;
import com.globalco.jobboard.model.User;
import com.globalco.jobboard.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtService jwtService =
            new JwtService("test-only-secret-key-not-for-production-32bytes-min", 604800000);

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    private AuthRequest request(String email, String password) {
        AuthRequest r = new AuthRequest();
        r.setEmail(email);
        r.setPassword(password);
        return r;
    }

    @Test
    void register_createsUser_andReturnsToken() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.register(request("Test@Example.com", "password123"));

        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getToken()).isNotBlank();
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_throwsConflict_whenEmailAlreadyUsed() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request("test@example.com", "password123")))
                .isInstanceOf(EmailAlreadyInUseException.class);
    }

    @Test
    void login_returnsToken_whenCredentialsValid() {
        User user = new User("test@example.com", passwordEncoder.encode("password123"));
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(request("test@example.com", "password123"));

        assertThat(response.getToken()).isNotBlank();
    }

    @Test
    void login_throwsInvalidCredentials_whenPasswordWrong() {
        User user = new User("test@example.com", passwordEncoder.encode("password123"));
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request("test@example.com", "wrongpassword")))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_throwsInvalidCredentials_whenUserNotFound() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request("missing@example.com", "password123")))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
