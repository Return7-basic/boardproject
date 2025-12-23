package return7.boardbackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder //추후 확인
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String loginId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String nickName;

    @OneToMany(mappedBy = "writer")
    private List<Board> boards = new ArrayList<>();

    @OneToMany(mappedBy = "writer")
    private List<Reply> replies = new ArrayList<>();

}
