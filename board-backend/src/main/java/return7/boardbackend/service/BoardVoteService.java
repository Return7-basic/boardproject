package return7.boardbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import return7.boardbackend.entity.Board;
import return7.boardbackend.entity.BoardVote;
import return7.boardbackend.entity.User;
import return7.boardbackend.enums.VoteType;
import return7.boardbackend.exception.BoardNotFoundException;
import return7.boardbackend.exception.UserNotFoundException;
import return7.boardbackend.repository.BoardRepository;
import return7.boardbackend.repository.BoardVoteRepository;
import return7.boardbackend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class BoardVoteService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final BoardVoteRepository boardVoteRepository;

    /**
     * 추천 비추천 적용
     */
    @Transactional
    public void vote(Long boardId, Long userId, VoteType type) {

        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자 없음"));

        // 게시글 조회
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글 없음"));

        // 기존 투표 조회
        boardVoteRepository.findByBoardAndUser(board, user)
                .ifPresentOrElse(
                        existingVote -> handleExistingVote(existingVote, type, board),
                        () -> createNewVote(board, user, type)
                );
    }

    /**
     * 기존 투표 처리
     */
    private void handleExistingVote(BoardVote existingVote,
                                    VoteType type,
                                    Board board) {

        // 같은 버튼 다시 누름 → 투표 취소
        if (existingVote.getVoteType() == type) {
            board.cancelVote(type);
            boardVoteRepository.delete(existingVote);
            return;
        }

        // 추천 ↔ 비추천 변경
        board.changeVote(existingVote.getVoteType(), type);
        existingVote.changeVote(type);
    }

    /**
     * 신규 투표 생성
     */
    private void createNewVote(Board board, User user, VoteType type) {

        BoardVote vote = BoardVote.builder()
                .board(board)
                .user(user)
                .voteType(type)
                .build();

        boardVoteRepository.save(vote);
        board.applyVote(type);
    }
}
