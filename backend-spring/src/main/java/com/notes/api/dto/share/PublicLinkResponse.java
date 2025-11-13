package com.notes.api.dto.share;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicLinkResponse {
    private String id;
    private String noteId;
    private String urlToken;
    private String publicUrl;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}


