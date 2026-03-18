package com.dermafind.auth.service;

import com.dermafind.auth.dto.*;
import com.dermafind.auth.exceptions.UserAlreadyExistsException;
import com.dermafind.auth.model.AppUser;
import com.dermafind.auth.model.RefreshToken;
import com.dermafind.auth.repository.UserRepository;
import com.dermafind.auth.security.JwtUtil;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final EntityManager entityManager; 

    public SafeUser getMe(String username){
        Optional<AppUser> user = userRepository.findByUsername(username);

        if (!user.isPresent()){
            throw new UsernameNotFoundException("The user could not be found");
        }

        AppUser foundUser = user.get();
        SafeUser safeUser = new SafeUser(foundUser.getId(), foundUser.getUsername(), foundUser.getEmail(), foundUser.getProfileUrl());
        return safeUser; 
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        AppUser user = new AppUser();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setProfileUrl(request.profileUrl());
        user.setUsername(request.username());

        userRepository.save(user);

        Map<String, Object> extraClaims = Map.of(
            "userId", user.getId(),
            "email", user.getEmail()
        );
        SafeUser safeUser = new SafeUser(user.getId(), user.getUsername(), user.getEmail(), user.getProfileUrl());

        String accessToken = jwtUtil.generateToken(extraClaims, user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(safeUser, accessToken, refreshToken.getToken());
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        entityManager.clear();

        AppUser user = userRepository.findByUsername(request.username())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Map<String, Object> extraClaims = Map.of(
            "userId", user.getId(),
            "email", user.getEmail()
        );
        SafeUser safeUser = new SafeUser(
            user.getId(), user.getUsername(),
            user.getEmail(), user.getProfileUrl()
        );

        String accessToken = jwtUtil.generateToken(extraClaims, user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(safeUser, accessToken, refreshToken.getToken());
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        // Validate token exists in DB, not revoked, not expired
        RefreshToken existing = refreshTokenService.validateRefreshToken(refreshToken);
        AppUser user = existing.getUser();
        SafeUser safeUser = new SafeUser(user.getId(), user.getUsername(), user.getEmail(), user.getProfileUrl());

        // Issue new access + refresh token (old one gets revoked inside createRefreshToken)
        String newAccessToken = jwtUtil.generateToken(user);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(safeUser, newAccessToken, newRefreshToken.getToken());
    }

    @Transactional
    public void logout(AppUser user) {
        refreshTokenService.revokeAllUserTokens(user.getId());
    }
}
