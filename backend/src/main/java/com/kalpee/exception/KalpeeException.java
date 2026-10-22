package com.kalpee.exception;

import java.util.Collections;
import java.util.Map;

public class KalpeeException extends RuntimeException {

    private final CodeErreur codeErreur;
    private final Map<String, String> details;

    public KalpeeException(CodeErreur codeErreur, String message) {
        super(message);
        this.codeErreur = codeErreur;
        this.details = Collections.emptyMap();
    }

    public KalpeeException(CodeErreur codeErreur, String message, Map<String, String> details) {
        super(message);
        this.codeErreur = codeErreur;
        this.details = details != null ? details : Collections.emptyMap();
    }

    public CodeErreur getCodeErreur() {
        return codeErreur;
    }

    public Map<String, String> getDetails() {
        return details;
    }
}
