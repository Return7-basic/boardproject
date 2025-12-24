package return7.boardbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import return7.boardbackend.dto.board.BoardDto;
import return7.boardbackend.entity.Board;
import return7.boardbackend.entity.Reply;
import return7.boardbackend.entity.User;
import return7.boardbackend.enums.Authority;
import return7.boardbackend.exception.*;
import return7.boardbackend.repository.BoardRepository;
import return7.boardbackend.repository.ReplyRepository;
import return7.boardbackend.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final ReplyRepository replyRepository;

    /**
     * 게시글 생성
     */
    @Transactional
    public Long createBoard(BoardDto boardDTO){
        User writer = userRepository.findByLoginId(boardDTO.getWriterLoginId())
                .orElseThrow(() -> new UserNotFoundException("작성자를 찾을 수 없습니다."));

        Board board = Board.builder()
                .title(boardDTO.getTitle())
                .content(boardDTO.getContent())
                .writer(writer)
                .viewCount(0)
                .build();
        return boardRepository.save(board).getId();
    }

    /**
     * 게시글 전체 조회
     */
    @Transactional(readOnly = true)
    public List<BoardDto> findAll(int page, int size){//내림차순정렬.
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        return boardRepository.findAll(pageable)
                .stream()
                .map(BoardDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 게시글 상세 조회
     */
    @Transactional
    public BoardDto findById(Long boardId){
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글이 존재하지 않습니다."));

        board.increaseViewCount();

        return BoardDto.from(board);
    }

    /**
     * 게시글 수정
     */
    @Transactional
    public void updateBoard(Long boardId, BoardDto dto, Long loginUserId){
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글이 존재하지 않습니다."));

        if(!board.getWriter().getId().equals(loginUserId)){//작성자만 수정가능하게.
            throw new WriterNotMatchException("수정 권한이 없습니다.");
        }
        board.update(dto.getTitle(), dto.getContent());

    }


    /**
     * 게시글 삭제
     */
    @Transactional
    public void deleteBoard(Long boardId,Long loginUserId){
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글이 존재하지 않습니다."));

        User user = userRepository.findById(loginUserId)
                .orElseThrow(()->new UserNotFoundException("사용자를 찾을 수 없습니다."));

        boolean isWriter = board.getWriter().getId().equals(user.getId());//작성자인가?
        boolean isAdmin = user.getAuthority() == Authority.ADMIN;//관리자인가?

        if(!isWriter && !isAdmin){//작성자 혹은 관리자인지?
            throw new NoAuthorityException("삭제 권한이 없습니다.");
        }
        boardRepository.delete(board);
    }

    /** 게시글의 댓글 채택 */
    @Transactional
    public void selectReply(Long boardId, Long replyId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글을 찾을 수 없습니다"));

        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("댓글을 찾을 수 없습니다"));

        // 댓글이 해당 게시글의 것인지 확인
        if (!reply.getBoard().getId().equals(boardId)) {
            throw new WriterNotMatchException("해당 게시글의 댓글이 아닙니다");
        }

        // 채택 처리
        board.selectReply(reply);

    }
}
