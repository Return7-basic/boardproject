package return7.boardbackend.dto.user;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
/** 회원가입 요청Dto*/
public class UserSignupRequest {
    private String loginId;
    private String password;
    private String nickName;
    private String email;
}
