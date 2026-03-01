package com.dermafind.auth.service;

import com.dermafind.auth.model.AppUser;
import com.dermafind.auth.model.RefreshToken;
import com.dermafind.auth.repository.RefreshTokenRepository;
import com.dermafind.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public RefreshToken createRefreshToken(AppUser user) {
        // Revoke all existing tokens for this user before issuing a new one
        refreshTokenRepository.revokeAllUserTokens(user);

        String tokenValue = jwtUtil.generateRefreshToken(user);

        RefreshToken refreshToken = RefreshToken.builder()
            .token(tokenValue)
            .user(user)
            .expiresAt(Instant.now().plusMillis(jwtUtil.getRefreshExpiration()))
            .revoked(false)
            .build();

        return refreshTokenRepository.save(refreshToken);
    }

    // Validates token exists in DB, is not revoked, and is not expired
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));

        if (refreshToken.isRevoked()) {
            throw new IllegalArgumentException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Refresh token has expired");
        }

        return refreshToken;
    }

    @Transactional
    public void revokeAllUserTokens(AppUser user) {
        refreshTokenRepository.revokeAllUserTokens(user);
    }
}