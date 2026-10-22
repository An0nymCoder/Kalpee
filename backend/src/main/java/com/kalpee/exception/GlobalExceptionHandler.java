package com.kalpee.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(KalpeeException.class)
    public ResponseEntity<ErreurResponseDto> handleKalpeeException(KalpeeException ex) {
        CodeErreur code = ex.getCodeErreur();
        ErreurResponseDto body = new ErreurResponseDto(
                code.name(),
                ex.getMessage(),
                ex.getDetails()
        );
        return ResponseEntity.status(code.getStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErreurResponseDto> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> details = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            details.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        ErreurResponseDto body = new ErreurResponseDto(
                CodeErreur.VALIDATION_ERROR.name(),
                "Les données saisies sont invalides.",
                details
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErreurResponseDto> handleUnreadableMessage(HttpMessageNotReadableException ex) {
        ErreurResponseDto body = new ErreurResponseDto(
                CodeErreur.VALIDATION_ERROR.name(),
                "Format de requête invalide.",
                Collections.emptyMap()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErreurResponseDto> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        ErreurResponseDto body = new ErreurResponseDto(
                CodeErreur.VALIDATION_ERROR.name(),
                "Le fichier dépasse la taille maximale autorisée de 5 Mo.",
                Map.of("file", "Taille maximale de 5 Mo dépassée")
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler({AuthenticationException.class, AccessDeniedException.class})
    public ResponseEntity<ErreurResponseDto> handleSecurityException(Exception ex) {
        ErreurResponseDto body = new ErreurResponseDto(
                CodeErreur.UNAUTHENTICATED.name(),
                "Authentification requise.",
                Collections.emptyMap()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErreurResponseDto> handleGenericException(Exception ex) {
        ErreurResponseDto body = new ErreurResponseDto(
                CodeErreur.VALIDATION_ERROR.name(),
                "Une erreur est survenue lors du traitement de la requête.",
                Collections.emptyMap()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
