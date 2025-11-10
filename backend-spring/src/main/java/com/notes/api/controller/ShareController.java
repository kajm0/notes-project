package com.notes.api.controller;

import com.notes.api.dto.share.PublicLinkResponse;
import com.notes.api.dto.share.ShareRequest;
import com.notes.api.security.UserPrincipal;
import com.notes.api.service.ShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
@Tag(name = "Share", description = "Note sharing endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ShareController {

    private final ShareService shareService;

    @PostMapping("/{noteId}/share/user")
    @Operation(summary = "Share note with another user")
    public ResponseEntity<Void> shareWithUser(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID noteId,
            @Valid @RequestBody ShareRequest request
    ) {
        shareService.shareWithUser(currentUser.getId(), noteId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{noteId}/share/public")
    @Operation(summary = "Create public link for note")
    public ResponseEntity<PublicLinkResponse> createPublicLink(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID noteId
    ) {
        return ResponseEntity.ok(shareService.createPublicLink(currentUser.getId(), noteId));
    }

    @DeleteMapping("/shares/{shareId}")
    @Operation(summary = "Revoke user share")
    public ResponseEntity<Void> revokeShare(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID shareId
    ) {
        shareService.revokeShare(currentUser.getId(), shareId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/public-links/{linkId}")
    @Operation(summary = "Revoke public link")
    public ResponseEntity<Void> revokePublicLink(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID linkId
    ) {
        shareService.revokePublicLink(currentUser.getId(), linkId);
        return ResponseEntity.noContent().build();
    }
}

