package com.dermafind.forum.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.dermafind.forum.repository.PostRepository;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import com.dermafind.forum.dto.NewPostRequest;
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

    public Page<Post> findAllUserPosts(String username, Pageable pageable){
        return postRepository.findByUsername(username, pageable);
    }

    public Post createPost(String username,  NewPostRequest newPost){
        Post post = new Post();
        post.setContent(newPost.content());
        post.setTitle(newPost.title());
        post.setAuthor(username);
        return postRepository.save(post);
    }
}
