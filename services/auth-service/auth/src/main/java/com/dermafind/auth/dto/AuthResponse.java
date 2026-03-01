package com.dermafind.auth.dto;

public record AuthResponse(
    String accessToken,
    String refreshToken
) {}