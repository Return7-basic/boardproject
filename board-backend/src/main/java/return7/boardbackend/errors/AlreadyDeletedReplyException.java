package return7.boardbackend.errors;

/**
 * 예외처리 - 이미 삭제된 리플
 */
public class AlreadyDeletedReplyException extends RuntimeException {
    public AlreadyDeletedReplyException(String message) {
        super(message);
    }
}
