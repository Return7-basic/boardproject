package return7.boardbackend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import return7.boardbackend.errors.*;

/**
 * 커스텀 에러 전역 처리
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AlreadyDeletedReplyException.class)
    public ResponseEntity<String> alreadyDeletedReplyException(AlreadyDeletedReplyException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
    }

    @ExceptionHandler(BoardNotFoundException.class)
    public ResponseEntity<String> boardNotFoundException(BoardNotFoundException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
    }

    @ExceptionHandler(NoAuthorityException.class)
    public ResponseEntity<String> noAuthorityException(NoAuthorityException e) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(e.getMessage());
    }

    @ExceptionHandler(ReplyAlreadyAcceptedException.class)
    public ResponseEntity<String> replyAlreadyAcceptedException(ReplyAlreadyAcceptedException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }


    @ExceptionHandler(ReplyNotFoundException.class)
    public ResponseEntity<String> replyNotFoundException(ReplyNotFoundException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> userNotFoundException(UserNotFoundException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
    }

    @ExceptionHandler(WriterNotMatchException.class)
    public ResponseEntity<String> writerNotMatchException(WriterNotMatchException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }
}
