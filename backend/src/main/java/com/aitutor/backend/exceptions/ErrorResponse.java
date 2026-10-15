package com.aitutor.backend.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.Instant;
import java.util.Map;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private Integer status;
    private String message;
    private Instant timestamp;
    private String path;
    private Map<String, String> errors;
}
