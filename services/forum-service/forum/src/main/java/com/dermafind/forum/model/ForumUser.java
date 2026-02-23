package com.dermafind.forum.model;

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
@Table(name = "Users")
@NoArgsConstructor
@AllArgsConstructor
class ForumUser implements UserDetails, CredentialsContainer{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
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
        return "";
    }

    @Override 
    public String getUsername(){
        return ""; 
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        return Collections.emptyList();
    }
}