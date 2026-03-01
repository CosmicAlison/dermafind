package com.dermafind.auth.dto;

public record AuthRequest(
    String username,
    String password
) {}

