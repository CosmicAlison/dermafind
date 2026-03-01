package com.dermafind.auth.model;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;

import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class AppUser implements UserDetails, CredentialsContainer{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @NotNull
    private String password; 

    @Email
    @Column(unique = true, nullable = false)
    private String email;

    @Override
    public void eraseCredentials(){
        this.password = null; 
    }

    @Override 
    public String getPassword(){
        return this.password;
    }

    @Override 
    public String getUsername(){
        return this.username; 
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        return Collections.emptyList();
    }
}
