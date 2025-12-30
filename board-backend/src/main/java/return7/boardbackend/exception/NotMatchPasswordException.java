package return7.boardbackend.exception;
/** 예외 처리- 비밀번호가 일치하지 않을 때*/
public class NotMatchPasswordException extends RuntimeException {
    public NotMatchPasswordException(String message) {
        super(message);
    }
}
