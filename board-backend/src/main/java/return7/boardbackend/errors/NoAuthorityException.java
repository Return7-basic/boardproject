package return7.boardbackend.errors;

/**
 * 예외처리 - 어드민 권한이 없을 떄
 */
public class NoAuthorityException extends RuntimeException {
    public NoAuthorityException(String message) {
        super(message);
    }
}
