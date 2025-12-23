package return7.boardbackend.errors;
/**
 * 예외처리 - 유저 수정,삭제 권한이 없을 떄
 */
public class WriterNotMatchException extends RuntimeException {
    public WriterNotMatchException(String message) {
        super(message);
    }
}
