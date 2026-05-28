package com.financeapp.finance_backend.service;

import com.financeapp.finance_backend.config.JwtUtil;
import com.financeapp.finance_backend.dto.AuthResponse;
import com.financeapp.finance_backend.dto.LoginRequest;
import com.financeapp.finance_backend.dto.RegisterRequest;
import com.financeapp.finance_backend.entity.User;
import com.financeapp.finance_backend.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       @Lazy PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already in use");

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .blocked(false)
                .build();
        userRepository.save(user);
        return new AuthResponse(
                jwtUtil.generateToken(user.getEmail(), user.getRole().name()),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    public AuthResponse registerAdmin(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already in use");

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.ADMIN)
                .blocked(false)
                .build();
        userRepository.save(user);
        return new AuthResponse(
                jwtUtil.generateToken(user.getEmail(), user.getRole().name()),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (user.isBlocked())
            throw new RuntimeException("Your account has been blocked");

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid credentials");

        return new AuthResponse(
                jwtUtil.generateToken(user.getEmail(), user.getRole().name()),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}