package return7.boardbackend.exception;

public class NotMatchPasswordException extends RuntimeException {
  public NotMatchPasswordException(String message) {
    super(message);
  }
}
