package return7.boardbackend.errors;

/**
 * 예외처리 - 대상 리플을 찾을 수 없을 때
 */
public class ReplyNotFoundException extends RuntimeException {
    public ReplyNotFoundException(String message) {
        super(message);
    }
}
