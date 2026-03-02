package com.dermafind.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dermafind.forum.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface PostRepository extends JpaRepository<Post, Long>{

    Page<Post>findAll(Pageable pageable);

    Page<Post>findByUsername(String username, Pageable pageable);
}
