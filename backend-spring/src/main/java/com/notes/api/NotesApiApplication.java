package com.notes.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class NotesApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotesApiApplication.class, args);
    }

}


