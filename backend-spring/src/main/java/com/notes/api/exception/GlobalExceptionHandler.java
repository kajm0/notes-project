package com.notes.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        String detailedMessage = ex.getMessage();
        
        // Rendre le message plus explicite et en français
        if (detailedMessage.contains("Utilisateur introuvable:")) {
            String email = detailedMessage.substring(detailedMessage.indexOf(":") + 2);
            detailedMessage = "❌ L'utilisateur '" + email + "' n'existe pas dans le système. Créez ce compte d'abord.";
        } else if (detailedMessage.contains("User not found with email:")) {
            String email = detailedMessage.substring(detailedMessage.indexOf(":") + 2);
            detailedMessage = "❌ L'utilisateur '" + email + "' n'existe pas. Veuillez créer ce compte d'abord.";
        } else if (detailedMessage.contains("User not found")) {
            detailedMessage = "❌ Utilisateur introuvable.";
        } else if (detailedMessage.contains("Note not found")) {
            detailedMessage = "❌ La note demandée n'existe pas ou a été supprimée.";
        } else if (detailedMessage.contains("Share not found")) {
            detailedMessage = "❌ Le partage demandé n'existe pas.";
        } else if (detailedMessage.contains("Public link not found")) {
            detailedMessage = "❌ Le lien public demandé n'existe pas.";
        }
        
        ErrorResponse error = ErrorResponse.builder()
                .code("RESOURCE_NOT_FOUND")
                .message(detailedMessage)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
        String detailedMessage = ex.getMessage();
        
        // Rendre le message plus explicite
        if (detailedMessage.contains("already shared")) {
            detailedMessage = "Cette note est déjà partagée avec cet utilisateur.";
        } else if (detailedMessage.contains("share note with yourself")) {
            detailedMessage = "Vous ne pouvez pas partager une note avec vous-même.";
        } else if (detailedMessage.contains("already exists")) {
            detailedMessage = "Un lien public existe déjà pour cette note.";
        }
        
        ErrorResponse error = ErrorResponse.builder()
                .code("BAD_REQUEST")
                .message(detailedMessage)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex) {
        String detailedMessage = ex.getMessage();
        
        // Rendre le message plus explicite
        if (detailedMessage.contains("don't have permission")) {
            if (detailedMessage.contains("share")) {
                detailedMessage = "Vous ne pouvez partager que vos propres notes. Cette note appartient à un autre utilisateur.";
            } else if (detailedMessage.contains("update")) {
                detailedMessage = "Vous ne pouvez modifier que vos propres notes.";
            } else if (detailedMessage.contains("delete")) {
                detailedMessage = "Vous ne pouvez supprimer que vos propres notes.";
            } else {
                detailedMessage = "Vous n'avez pas la permission d'accéder à cette ressource.";
            }
        }
        
        ErrorResponse error = ErrorResponse.builder()
                .code("FORBIDDEN")
                .message(detailedMessage)
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .code("INVALID_CREDENTIALS")
                .message("Invalid email or password")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> validationErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);
        });

        ErrorResponse error = ErrorResponse.builder()
                .code("VALIDATION_ERROR")
                .message("Validation failed")
                .details(validationErrors)
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .code("INVALID_INPUT")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        ex.printStackTrace();
        
        ErrorResponse error = ErrorResponse.builder()
                .code("INTERNAL_SERVER_ERROR")
                .message("An unexpected error occurred. Please try again later.")
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}


