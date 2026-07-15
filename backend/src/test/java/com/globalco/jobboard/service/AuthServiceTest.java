package com.globalco.jobboard.service;

import com.globalco.jobboard.dto.AuthRequest;
import com.globalco.jobboard.dto.AuthResponse;
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
    void login_returnsToken_whenCredentialsValid() {
        User user = new User("kancham@gmail.com", passwordEncoder.encode("kancham@gmail.com"));
        when(userRepository.findByEmail("kancham@gmail.com")).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(request("kancham@gmail.com", "kancham@gmail.com"));

        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getEmail()).isEqualTo("kancham@gmail.com");
    }

    @Test
    void login_throwsInvalidCredentials_whenPasswordWrong() {
        User user = new User("kancham@gmail.com", passwordEncoder.encode("kancham@gmail.com"));
        when(userRepository.findByEmail("kancham@gmail.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request("kancham@gmail.com", "wrongpassword")))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_throwsInvalidCredentials_whenUserNotFound() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request("missing@example.com", "password123")))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
