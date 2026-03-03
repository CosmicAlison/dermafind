package com.dermafind.auth.dto;

public record AuthResponse(
    SafeUser user,
    String accessToken,
    String refreshToken
) {}