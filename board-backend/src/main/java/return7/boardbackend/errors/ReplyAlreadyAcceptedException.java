package return7.boardbackend.errors;

/**
 * 예외처리 - 이미 채택된 댓글이 존재할 때
 */
public class ReplyAlreadyAcceptedException extends RuntimeException {
    public ReplyAlreadyAcceptedException(String message) {
        super(message);
    }
}
