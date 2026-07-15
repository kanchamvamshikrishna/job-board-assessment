package com.globalco.jobboard.service;

import com.globalco.jobboard.dto.AuthRequest;
import com.globalco.jobboard.dto.AuthResponse;
import com.globalco.jobboard.exception.EmailAlreadyInUseException;
import com.globalco.jobboard.exception.InvalidCredentialsException;
import com.globalco.jobboard.model.User;
import com.globalco.jobboard.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyInUseException(email);
        }

        User user = new User(email, passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(email), email);
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return new AuthResponse(jwtService.generateToken(email), email);
    }
}
