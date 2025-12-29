package return7.boardbackend.exception;

/** 예외 처리-기존에 사용하는 유저가 존재할 때*/
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
