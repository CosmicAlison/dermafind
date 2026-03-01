package com.dermafind.auth.dto;

public record RegisterRequest(
    String username,
    String password,
    String email
) {}