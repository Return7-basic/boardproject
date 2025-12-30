package return7.boardbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import return7.boardbackend.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    //로그인,인증
    Optional<User> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);

    boolean existsByNickname(String nickname);

    Optional<User> findByEmailAndId(String email, Long id);
}
