package return7.boardbackend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private static final long EXPIRATION_MINUTES = 10L;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiredAt;

    public static PasswordResetToken create(User user){
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.user = user;
        passwordResetToken.token = UUID.randomUUID().toString();
        passwordResetToken.expiredAt = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);//10분 만료시간
        return passwordResetToken;
    }

    /** 만료 체크 여부 */
    public boolean isExpired(){
        return LocalDateTime.now().isAfter(expiredAt);
    }

    public void forceExpire(){
        this.expiredAt = LocalDateTime.now();
    }
}
