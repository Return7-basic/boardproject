package return7.boardbackend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PasswordResetRequestDto {
    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "이메일을 입력해주세요")
    private String email;

    @NotBlank
    private String loginId;
}
