package com.notes.api.service;

import com.notes.api.dto.share.PublicLinkResponse;
import com.notes.api.dto.share.ShareRequest;
import com.notes.api.entity.Note;
import com.notes.api.entity.PublicLink;
import com.notes.api.entity.Share;
import com.notes.api.entity.User;
import com.notes.api.exception.BadRequestException;
import com.notes.api.exception.ForbiddenException;
import com.notes.api.exception.ResourceNotFoundException;
import com.notes.api.repository.NoteRepository;
import com.notes.api.repository.PublicLinkRepository;
import com.notes.api.repository.ShareRepository;
import com.notes.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShareService {

    private final ShareRepository shareRepository;
    private final PublicLinkRepository publicLinkRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private static final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void shareWithUser(UUID ownerId, UUID noteId, ShareRequest request) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!note.getOwner().getId().equals(ownerId)) {
            throw new ForbiddenException("Vous ne pouvez partager que vos propres notes");
        }

        User sharedWithUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable: " + request.getEmail()));

        if (sharedWithUser.getId().equals(ownerId)) {
            throw new BadRequestException("Vous ne pouvez pas partager une note avec vous-même");
        }

        if (shareRepository.existsByNoteAndSharedWithUser(note, sharedWithUser)) {
            throw new BadRequestException("Cette note est déjà partagée avec cet utilisateur");
        }

        Share share = Share.builder()
                .note(note)
                .sharedWithUser(sharedWithUser)
                .permission(Share.Permission.READ)
                .build();

        shareRepository.save(share);

        if (note.getVisibility() != Note.Visibility.SHARED) {
            note.setVisibility(Note.Visibility.SHARED);
            noteRepository.save(note);
        }
    }

    @Transactional
    public PublicLinkResponse createPublicLink(UUID ownerId, UUID noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!note.getOwner().getId().equals(ownerId)) {
            throw new ForbiddenException("You don't have permission to create a public link for this note");
        }

        // Return existing link if it already exists
        var existingLink = publicLinkRepository.findByNoteId(noteId);
        if (existingLink.isPresent()) {
            return mapToPublicLinkResponse(existingLink.get());
        }

        String urlToken = generateUrlToken();

        PublicLink publicLink = PublicLink.builder()
                .note(note)
                .urlToken(urlToken)
                .build();

        publicLink = publicLinkRepository.save(publicLink);

        if (note.getVisibility() != Note.Visibility.PUBLIC) {
            note.setVisibility(Note.Visibility.PUBLIC);
            noteRepository.save(note);
        }

        return mapToPublicLinkResponse(publicLink);
    }

    @Transactional
    public void revokeShare(UUID ownerId, UUID shareId) {
        Share share = shareRepository.findById(shareId)
                .orElseThrow(() -> new ResourceNotFoundException("Share not found"));

        if (!share.getNote().getOwner().getId().equals(ownerId)) {
            throw new ForbiddenException("You don't have permission to revoke this share");
        }

        Note note = share.getNote();
        shareRepository.delete(share);

        // Si la note était SHARED et qu'il ne reste plus de partages actifs, la rendre PRIVATE
        if (note.getVisibility() == Note.Visibility.SHARED) {
            var remainingShares = shareRepository.findByNote(note);
            if (remainingShares.isEmpty()) {
                note.setVisibility(Note.Visibility.PRIVATE);
                noteRepository.save(note);
            }
        }
    }

    @Transactional
    public void revokePublicLink(UUID ownerId, UUID linkId) {
        PublicLink publicLink = publicLinkRepository.findById(linkId)
                .orElseThrow(() -> new ResourceNotFoundException("Public link not found"));

        if (!publicLink.getNote().getOwner().getId().equals(ownerId)) {
            throw new ForbiddenException("You don't have permission to revoke this public link");
        }

        publicLinkRepository.delete(publicLink);

        Note note = publicLink.getNote();
        note.setVisibility(Note.Visibility.PRIVATE);
        noteRepository.save(note);
    }

    @Transactional(readOnly = true)
    public int getSharedUsersCount(UUID ownerId, UUID noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!note.getOwner().getId().equals(ownerId)) {
            throw new ForbiddenException("You don't have permission to access this note's share information");
        }

        return shareRepository.findByNote(note).size();
    }

    @Transactional(readOnly = true)
    public Note getNoteByPublicToken(String token) {
        PublicLink publicLink = publicLinkRepository.findByUrlToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Public link not found or expired"));

        if (publicLink.getExpiresAt() != null && publicLink.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new ResourceNotFoundException("Public link has expired");
        }

        return publicLink.getNote();
    }

    private String generateUrlToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private PublicLinkResponse mapToPublicLinkResponse(PublicLink publicLink) {
        return PublicLinkResponse.builder()
                .id(publicLink.getId().toString())
                .noteId(publicLink.getNote().getId().toString())
                .urlToken(publicLink.getUrlToken())
                .publicUrl("/p/" + publicLink.getUrlToken())
                .expiresAt(publicLink.getExpiresAt())
                .createdAt(publicLink.getCreatedAt())
                .build();
    }
}


