package com.dermafind.forum.controller;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import com.dermafind.forum.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.dermafind.forum.model.Post;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.data.web.PageableDefault;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Controller
@Getter
@Setter
@AllArgsConstructor
@RequestMapping("api/post")
public class PostController{
    private final PostService postService; 

    @GetMapping("/")
    public ResponseEntity<Page<Post>> getAllPosts(
        @PageableDefault(size=10, sort = "createdAyt", direction = Sort.Direction.DESC)
        Pageable pageable
    ){
        Page<Post> posts = postService.findAllPosts(pageable);
        return ResponseEntity.ok(posts);
    }
}