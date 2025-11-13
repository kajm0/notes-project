package com.notes.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notes.api.dto.note.NoteRequest;
import com.notes.api.dto.note.NoteResponse;
import com.notes.api.entity.Note;
import com.notes.api.service.NoteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class NoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NoteService noteService;

    /**
     * Test "heureux" : récupération de la liste des notes
     */
    @Test
    @WithMockUser(username = "test@example.com")
    void getNotes_Success_ReturnsPageOfNotes() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        UUID noteId1 = UUID.randomUUID();
        UUID noteId2 = UUID.randomUUID();

        NoteResponse note1 = NoteResponse.builder()
                .id(noteId1.toString())
                .title("Note 1")
                .contentMd("Contenu de la note 1")
                .visibility(Note.Visibility.PRIVATE)
                .build();

        NoteResponse note2 = NoteResponse.builder()
                .id(noteId2.toString())
                .title("Note 2")
                .contentMd("Contenu de la note 2")
                .visibility(Note.Visibility.PUBLIC)
                .build();

        List<NoteResponse> notes = Arrays.asList(note1, note2);
        Pageable pageable = PageRequest.of(0, 10);
        Page<NoteResponse> page = new PageImpl<>(notes, pageable, notes.size());

        when(noteService.searchNotes(
                any(UUID.class),
                eq(null),
                eq(null),
                eq(null),
                any(Pageable.class)
        )).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/v1/notes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].title").value("Note 1"))
                .andExpect(jsonPath("$.content[1].title").value("Note 2"))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    /**
     * Test "heureux" : création d'une note
     */
    @Test
    @WithMockUser(username = "test@example.com")
    void createNote_Success_ReturnsCreatedNote() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        UUID noteId = UUID.randomUUID();

        NoteRequest request = new NoteRequest();
        request.setTitle("Nouvelle note");
        request.setContentMd("Contenu de la nouvelle note");
        request.setVisibility(Note.Visibility.PRIVATE);
        request.setTags(new HashSet<>(Arrays.asList("travail", "important")));

        NoteResponse response = NoteResponse.builder()
                .id(noteId.toString())
                .title("Nouvelle note")
                .contentMd("Contenu de la nouvelle note")
                .visibility(Note.Visibility.PRIVATE)
                .build();

        when(noteService.createNote(any(UUID.class), any(NoteRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Nouvelle note"))
                .andExpect(jsonPath("$.contentMd").value("Contenu de la nouvelle note"))
                .andExpect(jsonPath("$.visibility").value("PRIVATE"));
    }
}

