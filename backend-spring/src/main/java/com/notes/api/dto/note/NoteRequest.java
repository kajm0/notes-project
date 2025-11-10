package com.notes.api.dto.note;

import com.notes.api.entity.Note;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class NoteRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(max = 50000, message = "Content cannot exceed 50000 characters")
    private String contentMd;

    private Note.Visibility visibility = Note.Visibility.PRIVATE;

    private Set<String> tags;
}

