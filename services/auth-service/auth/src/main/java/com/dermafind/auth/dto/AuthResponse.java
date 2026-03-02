package com.dermafind.auth.dto;

import com.dermafind.auth.model.AppUser;

public record AuthResponse(
    AppUser user,
    String accessToken,
    String refreshToken
) {}