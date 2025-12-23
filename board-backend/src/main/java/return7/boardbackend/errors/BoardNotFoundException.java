package return7.boardbackend.errors;

/**
 * 예외처리 - 게시글을 찾을 수 없음
 */
public class BoardNotFoundException extends RuntimeException {
    public BoardNotFoundException(String message) {
        super(message);
    }
}
