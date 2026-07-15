package com.globalco.jobboard.exception;

public class EmailAlreadyInUseException extends RuntimeException {
    public EmailAlreadyInUseException(String email) {
        super("An account with email " + email + " already exists");
    }
}
