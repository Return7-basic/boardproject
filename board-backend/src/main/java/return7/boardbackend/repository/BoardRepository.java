package return7.boardbackend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import return7.boardbackend.entity.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {

    @Query("select b FROM Board b WHERE b.title like concat('%', :keyword, '%')")
    Page<Board> findByStringLike(@Param("keyword") String title, Pageable pageable);
}
