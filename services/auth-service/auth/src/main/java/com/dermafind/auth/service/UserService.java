package com.dermafind.auth.service;

import com.dermafind.auth.dto.*;
import com.dermafind.auth.model.AppUser;
import com.dermafind.auth.model.RefreshToken;
import com.dermafind.auth.repository.UserRepository;
import com.dermafind.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        AppUser user = new AppUser(
            null,
            request.username(),
            passwordEncoder.encode(request.password()),
            request.email()
        );
        userRepository.save(user);

        String accessToken = jwtUtil.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        AppUser user = userRepository.findByUsername(request.username())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String accessToken = jwtUtil.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken.getToken());
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        // Validate token exists in DB, not revoked, not expired
        RefreshToken existing = refreshTokenService.validateRefreshToken(request.refreshToken());
        AppUser user = existing.getUser();

        // Issue new access + refresh token (old one gets revoked inside createRefreshToken)
        String newAccessToken = jwtUtil.generateToken(user);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(newAccessToken, newRefreshToken.getToken());
    }

    @Transactional
    public void logout(AppUser user) {
        refreshTokenService.revokeAllUserTokens(user);
    }
}
