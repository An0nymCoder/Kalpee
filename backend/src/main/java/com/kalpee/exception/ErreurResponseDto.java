package com.kalpee.exception;

import java.util.Map;

public record ErreurResponseDto(
        String code,
        String message,
        Map<String, String> details
) {
}
