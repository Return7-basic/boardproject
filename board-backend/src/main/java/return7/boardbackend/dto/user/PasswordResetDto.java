package return7.boardbackend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PasswordResetDto {

    @NotBlank(message = "토큰이 필요합니다.")
    private String token;


    @Size(min=8,max=20,message="비밀번호는 8자 이상 20자 이하여야 합니다.")
    private String newPassword;
}