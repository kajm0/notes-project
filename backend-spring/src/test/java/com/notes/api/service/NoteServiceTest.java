package com.notes.api.service;

import com.notes.api.dto.note.NoteRequest;
import com.notes.api.dto.note.NoteResponse;
import com.notes.api.entity.Note;
import com.notes.api.entity.Tag;
import com.notes.api.entity.User;
import com.notes.api.repository.NoteRepository;
import com.notes.api.repository.TagRepository;
import com.notes.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private NoteService noteService;

    private UUID userId;
    private User user;
    private NoteRequest noteRequest;
    private Note note;
    private Tag tag;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .build();

        noteRequest = new NoteRequest();
        noteRequest.setTitle("Test Note");
        noteRequest.setContentMd("# Test Content");
        noteRequest.setVisibility(Note.Visibility.PRIVATE);
        noteRequest.setTags(Set.of("test", "work"));

        tag = Tag.builder()
                .id(UUID.randomUUID())
                .label("test")
                .build();

        note = Note.builder()
                .id(UUID.randomUUID())
                .owner(user)
                .title("Test Note")
                .contentMd("# Test Content")
                .visibility(Note.Visibility.PRIVATE)
                .build();
    }

    @Test
    void createNote_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(tagRepository.findByLabel(anyString())).thenReturn(Optional.of(tag));
        when(noteRepository.save(any(Note.class))).thenReturn(note);

        NoteResponse response = noteService.createNote(userId, noteRequest);

        assertNotNull(response);
        assertEquals("Test Note", response.getTitle());
        assertEquals("# Test Content", response.getContentMd());
        verify(noteRepository, times(1)).save(any(Note.class));
    }

    @Test
    void createNote_UserNotFound_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> noteService.createNote(userId, noteRequest));
        verify(noteRepository, never()).save(any(Note.class));
    }
}

