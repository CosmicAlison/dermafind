package com.dermafind.forum.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.dermafind.forum.repository.PostRepository;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import com.dermafind.forum.model.Post;

@Service
@Getter
@Setter
@AllArgsConstructor
public class PostService {
    private final PostRepository postRepository;

    public Page<Post> findAllPosts(Pageable pageable){
        return postRepository.findAll(pageable);
    }

    public Page<Post> findAllUserPosts(Pageable pageable){
        return postRepository.findByUsername(null, pageable);
    }
}
