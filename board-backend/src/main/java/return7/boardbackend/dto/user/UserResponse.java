package return7.boardbackend.dto.user;

import lombok.Builder;
import lombok.Getter;
import return7.boardbackend.entity.User;
import return7.boardbackend.enums.Authority;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String loginId;
    private String nickname;
    private String email;
    private Authority authority;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .loginId(user.getLoginId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .authority(user.getAuthority())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
