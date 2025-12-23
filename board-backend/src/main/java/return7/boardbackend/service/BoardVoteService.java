package return7.boardbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import return7.boardbackend.entity.Board;
import return7.boardbackend.entity.BoardVote;
import return7.boardbackend.entity.User;
import return7.boardbackend.entity.VoteType;
import return7.boardbackend.repository.BoardRepository;
import return7.boardbackend.repository.BoardVoteRepository;
import return7.boardbackend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class BoardVoteService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final BoardVoteRepository boardVoteRepository;

    @Transactional
    public void vote(Long boardId, String loginId, VoteType type){
        // 사용자 조회
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        // 게시글 조회(Board)
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        // 기존 투표 조회
        boardVoteRepository.findByBoardAndUser(board, user)
                .ifPresentOrElse(
                        // 투표를 했는 경우
                        existingVote -> handleExistingVote(existingVote, type, board),

                        // 투표를 하지 않은 경우
                        () -> createNewVote(board, user, type)

                );
    }

    // 기존 투표 처리
    private void handleExistingVote(BoardVote existingVote,
                                    VoteType type, Board board){

        // 같은 버튼 다시 누름 -> 취소
        if (existingVote.getVoteType() == type) {
            boardVoteRepository.delete(existingVote);
            board.adjustRecommendation(existingVote.getVoteType(), -1);
            return;
        }

        // 추천 <-> 비추천 변경
        board.adjustRecommendation(existingVote.getVoteType(), -1);
        existingVote.changeVote(type);
        board.adjustRecommendation(type, +1);
    }

    // 신규 투표 생성
    private void createNewVote(Board board, User user, VoteType type){
        BoardVote vote = BoardVote.builder()
                .board(board)
                .user(user)
                .voteType(type)
                .build();
        boardVoteRepository.save(vote);
        board.adjustRecommendation(type, +1);


    }
}
