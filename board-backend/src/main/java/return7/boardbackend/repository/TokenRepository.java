package return7.boardbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import return7.boardbackend.entity.PasswordResetToken;
import return7.boardbackend.entity.User;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<PasswordResetToken,String> {

    Optional<PasswordResetToken> findByToken(String token);

    @Modifying
    @Query("delete from PasswordResetToken t where t.user = :user")
    void deleteAllByUser(@Param("user") User user);

    List<PasswordResetToken> findByUser(User user);
}
