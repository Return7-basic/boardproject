package return7.boardbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import return7.boardbackend.enums.Authority;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String loginId;//사용자지정 로그인아이디

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true,length = 20)
    private String nickName;//닉네임 중복x

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Authority authority=Authority.USER;

    @Column(name ="created_at")
    @Builder.Default
    private LocalDateTime createdAt=LocalDateTime.now();//회원가입 완료시간

    @Column(name ="updated_at")
    private LocalDateTime updatedAt;// 정보 수정 시각

    private String email;//이메일찾기, 비밀번호 재설정에 사용

    @OneToMany(mappedBy = "writer", fetch = FetchType.LAZY)
    private List<Board> boards = new ArrayList<>();

    @OneToMany(mappedBy = "writer")
    private List<Reply> replies = new ArrayList<>();

    /** 비밀번호 변경 */
    public void updatePassword(String newPassword){
        this.password=newPassword;
        this.updatedAt=LocalDateTime.now();
    }

    /** 닉네임 변경*/
    public void updateNickName(String newNickName){
        this.nickName=newNickName;
        this.updatedAt=LocalDateTime.now();
    }


}
