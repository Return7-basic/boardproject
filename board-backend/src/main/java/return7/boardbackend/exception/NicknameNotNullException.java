package return7.boardbackend.exception;
/** 예외 처리-닉네임이 비어 있을 때*/
public class NicknameNotNullException extends RuntimeException {
    public NicknameNotNullException(String message) {
        super(message);
    }
}
