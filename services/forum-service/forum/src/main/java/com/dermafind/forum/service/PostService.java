package com.dermafind.forum.service;

import java.util.Optional;

import javax.naming.NameNotFoundException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;
import com.dermafind.forum.repository.PostRepository;

import jakarta.persistence.EntityNotFoundException;
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

    public Page<Post> findAllUserPosts(Long userId, Pageable pageable){
        return postRepository.findByAuthorId(userId, pageable);
    }

    public Post createPost(Long userId,  NewPostRequest newPost){
        Post post = new Post();
        post.setContent(newPost.content());
        post.setTitle(newPost.title());
        post.setAuthorId(userId); 
        return postRepository.save(post);
    }

    public void deletePost(Long userId, Long postId){
        Optional<Post> post = postRepository.findById(postId);
        if (!post.isPresent()){
            throw new EntityNotFoundException("Post not found.");
        }

        Post foundPost = post.get();
        if (!foundPost.getAuthorId().equals(userId)){
            throw new AuthorizationDeniedException("Attempted to delete a post you do not own");
        };

        postRepository.delete(foundPost);
    }
}
