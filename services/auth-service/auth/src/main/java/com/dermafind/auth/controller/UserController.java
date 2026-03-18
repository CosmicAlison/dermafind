
package com.dermafind.auth.controller;

import com.dermafind.auth.dto.AuthRequest;
import com.dermafind.auth.dto.AuthResponse;

import com.dermafind.auth.dto.RegisterRequest;

import com.dermafind.auth.model.AppUser;
import com.dermafind.auth.service.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.RequiredArgsConstructor;

import java.util.Arrays;

import org.springframework.http.HttpHeaders;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me") public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) { 
        return ResponseEntity.ok(userService.getMe(userDetails.getUsername())); 
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request); 

        Cookie secureCookie = new Cookie("refreshToken", response.refreshToken());
        secureCookie.setHttpOnly(true);
        secureCookie.setSecure(true);

        secureCookie.setPath("/");

        String cookieHeader = String.format("%s=%s; HttpOnly; Secure; Path=%s; SameSite=Lax",
                secureCookie.getName(), secureCookie.getValue(), secureCookie.getPath());

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookieHeader)
            .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = userService.login(request); 

        Cookie secureCookie = new Cookie("refreshToken", response.refreshToken());
        secureCookie.setHttpOnly(true);
        secureCookie.setSecure(true);

        secureCookie.setPath("/");

        String cookieHeader = String.format("%s=%s; HttpOnly; Secure; Path=%s; SameSite=Lax",
                secureCookie.getName(), secureCookie.getValue(), secureCookie.getPath());

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookieHeader)
            .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
    
        if (cookies == null) return ResponseEntity.status(401).build();
        
        String refreshToken = Arrays.stream(cookies)
            .filter(c -> c.getName().equals("refreshToken"))
            .map(Cookie::getValue)
            .findFirst()
            .orElse(null);

        if (refreshToken == null) return ResponseEntity.status(401).build();
        
        AuthResponse response = userService.refresh(refreshToken); 

        Cookie secureCookie = new Cookie("refreshToken", response.refreshToken());
        secureCookie.setHttpOnly(true);
        secureCookie.setSecure(true);

        secureCookie.setPath("/");

        String cookieHeader = String.format("%s=%s; HttpOnly; Secure; Path=%s; SameSite=Lax",
                secureCookie.getName(), secureCookie.getValue(), secureCookie.getPath());

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookieHeader)
            .body(response);
    }


    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal AppUser user) {
        userService.logout(user);
        return ResponseEntity.noContent().build();
    }

}