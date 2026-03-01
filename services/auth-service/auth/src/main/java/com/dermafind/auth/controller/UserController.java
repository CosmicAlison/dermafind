
package com.dermafind.auth.controller;

import com.dermafind.auth.dto.AuthRequest;
import com.dermafind.auth.dto.AuthResponse;
import com.dermafind.auth.dto.RefreshRequest;
import com.dermafind.auth.dto.RegisterRequest;
import com.dermafind.auth.model.AppUser;
import com.dermafind.auth.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(userService.refresh(request));
    }


    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal AppUser user) {
        userService.logout(user);
        return ResponseEntity.noContent().build();
    }
}