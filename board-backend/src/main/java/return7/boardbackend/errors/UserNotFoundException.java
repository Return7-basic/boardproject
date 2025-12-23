package return7.boardbackend.errors;

/**
 * 예외처리 - 대상 유저가 없을 때
 */
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
