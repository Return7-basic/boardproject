package return7.boardbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import return7.boardbackend.dto.BoardDTO;
import return7.boardbackend.entity.Board;
import return7.boardbackend.entity.User;
import return7.boardbackend.repository.BoardRepository;
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

    //게시글 생성
    @Transactional
    public Long createBoard(BoardDTO boardDTO){
        User writer = userRepository.findByLoginId(boardDTO.getWriterLoginId())
                .orElseThrow(() -> new RuntimeException("작성자를 찾을 수 없습니다."));

        Board board = Board.builder()
                .title(boardDTO.getTitle())
                .content(boardDTO.getContent())
                .writer(writer)
                .viewCount(0)
                .recommendation(0)
                .build();
        return boardRepository.save(board).getId();
    }

    //게시글 전체 조회
    @Transactional(readOnly = true)
    public List<BoardDTO> findAll(int page,int size){//내림차순정렬.
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        return boardRepository.findAll(pageable)
                .stream()
                .map(BoardDTO::from)
                .collect(Collectors.toList());
    }

    //게시글 상세 조회
    @Transactional
    public BoardDTO findById(Long boardId){
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));
        //추후 전역 예외 생성

        board.increaseViewCount();

        return BoardDTO.from(board);
    }

    //게시글 수정
    @Transactional
    public void updateBoard(Long boardId, BoardDTO dto,Long loginUserId){
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        if(!board.getWriter().getId().equals(loginUserId)){//작성자만 수정가능하게.
            throw new RuntimeException("수정 권한이 없습니다.");
        }
        board.update(dto.getTitle(), dto.getContent());

    }

    //게시글 삭제
    @Transactional
    public void deleteBoard(Long boardId,Long loginUserId){
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글이 존재하지 않습니다."));

        if(!board.getWriter().getId().equals(loginUserId)){//작성자만 수정가능하게.
            throw new RuntimeException("삭제 권한이 없습니다.");
        }
        boardRepository.delete(board);
    }
}
