package com.dermafind.forum.controller;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import com.dermafind.forum.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.dermafind.forum.dto.NewPostRequest;
import com.dermafind.forum.model.Post;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.data.web.PageableDefault;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Controller
@Getter
@Setter
@AllArgsConstructor
@RequestMapping("api/forum/post")
public class PostController{
    private final PostService postService; 

    @GetMapping
    public ResponseEntity<Page<Post>> getAllPosts(
        @PageableDefault(size=10, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable
    ){
        Page<Post> posts = postService.findAllPosts(pageable);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Post>> getUserPosts(@PathVariable Long userId,
        @PageableDefault (size=10, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable
    ){
        return ResponseEntity.ok(postService.findAllUserPosts(userId, pageable));
    }

    @PostMapping
    public ResponseEntity<Post> savePost(@RequestHeader("X-User-Id") Long userId, @RequestBody NewPostRequest newPost){
        return ResponseEntity.ok(postService.createPost(userId, newPost));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId, @RequestHeader("X-User-Id") Long userId){
        postService.deletePost(userId, postId);
        return ResponseEntity.noContent().build();
    }
}