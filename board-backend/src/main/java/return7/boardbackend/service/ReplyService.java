package return7.boardbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import return7.boardbackend.dto.reply.RequestReplyDto;
import return7.boardbackend.dto.reply.ResponseReplyDto;
import return7.boardbackend.dto.reply.SliceResponseDto;
import return7.boardbackend.entity.Board;
import return7.boardbackend.entity.Reply;
import return7.boardbackend.entity.ReplyVote;
import return7.boardbackend.entity.User;
import return7.boardbackend.enums.VoteType;
import return7.boardbackend.exception.*;
import return7.boardbackend.repository.BoardRepository;
import return7.boardbackend.repository.ReplyRepository;
import return7.boardbackend.repository.ReplyVoteRepository;
import return7.boardbackend.repository.UserRepository;

import java.util.Collection;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReplyService {
    private final ReplyRepository replyRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final ReplyVoteRepository replyVoteRepository;

    // 진짜 삭제는 Admin만 <= 프론트에서 구현,
    // 삭제는 msg를 댓글이 삭제되었다고 구현
    // 댓글 추천 기능
    // 댓글 채택 기능

    /**
     * 댓글 작성
     */
    @Transactional
    public ResponseReplyDto create(RequestReplyDto replyDto, Long userId) {
        Reply reply = Reply.builder()
                .content(replyDto.getContent())
                .board(boardRepository.findById(replyDto.getBoardId())
                        .orElseThrow(() -> new BoardNotFoundException("게시글을 찾을 수 없습니다.")))
                .writer(userRepository.findById(userId)
                        .orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다.")))
                .parent(replyRepository.findById(replyDto.getParentId())
                        .orElseThrow(() -> new ReplyNotFoundException("답글을 찾을 수 없습니다.")))
                .build();
        Reply saved = replyRepository.save(reply);
        return ResponseReplyDto.from(saved);
    }

    /**
     * 댓글 수정
     */
    @Transactional
    public ResponseReplyDto update(ResponseReplyDto replyDto, Long userId) {
        Reply reply = replyRepository.findById(replyDto.getId())
                .orElseThrow(() -> new ReplyNotFoundException("답글을 찾을 수 없습니다."));
        User loginUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다."));

        if (loginUser != reply.getWriter()) {
            throw new WriterNotMatchException("권한이 없습니다."); // 에러 목록 추가사항
        }

        if (reply.isDeleted()) {
            throw new AlreadyDeletedReplyException("이미 삭제된 댓글입니다.");
        }

        if(reply.getContent() != null) {
            reply.setContent(replyDto.getContent());
        }

        return ResponseReplyDto.from(replyRepository.save(reply));
    }

    /**
     * 댓글 soft 삭제
     */
    @Transactional
    public ResponseReplyDto delete(Long replyId, Long userId) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("답글을 찾을 수 없습니다."));

        if (!reply.getWriter().getId().equals(userId)) {
            throw new WriterNotMatchException("권한이 없습니다."); // 에러 목록 추가사항
        }
        // 추후 삭제 여부 고민
        if (reply.isDeleted()) {
            throw new AlreadyDeletedReplyException("이미 삭제된 댓글입니다.");
        }
        reply.setDeleted(true);
        Reply saved = replyRepository.save(reply);

        ResponseReplyDto from = ResponseReplyDto.from(saved);
        from.setContent("삭제된 댓글입니다.");
        return from;
    }

    /**
     * 댓글 hard 삭제
     */
    @Transactional
    public void deleteHard(Long replyId, Collection<? extends GrantedAuthority> authorities) {
        boolean isAdmin = authorities.stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new NoAuthorityException("권한이 없습니다.");
        }
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("답글을 찾을 수 없습니다."));
        replyRepository.delete(reply);
    }

    /**
     * 보드ID 기준 댓글 전체 목록 (임시)
     */
    @Transactional(readOnly = true)
    public SliceResponseDto getReplyByBoard(Long boardId,String sort, Integer cursorScore, Long cursorId, int size) {
        Pageable pageable = PageRequest.of(0, size +1);
        List<Reply> replies = new ArrayList<>();

        if ("latest".equalsIgnoreCase(sort.trim())){
            replies = (cursorId == null)
                    ? replyRepository.findByBoardIdOrderByIdDesc(boardId, pageable)
                    : replyRepository.findByBoardIdAndIdLessThanOrderByIdDesc(boardId, cursorId, pageable);
        } else {
            replies = (cursorId == null)
                    ? replyRepository.findByBoardIdOrderByRecommendationDescIdDesc(boardId, pageable)
                    : replyRepository.findByBest(boardId,cursorScore, cursorId, pageable);
        }

        boolean hasNext = false;
        if (replies.size() > size) {
            hasNext = true;
            replies.remove(size);
        }

        List<ResponseReplyDto> dtoList = replies.stream()
                .map(ResponseReplyDto::from)
                .toList();

        Long nextCursor;
        Integer nextScore;
        if (!replies.isEmpty()) {
             nextCursor = replies.get(replies.size() - 1).getId();
            if (!"latest".equalsIgnoreCase(sort.trim())) {
                nextScore = replies.get(replies.size() - 1).getRecommendation();
            } else {
                nextScore = null;
            }
        } else {
            nextCursor = -1L;
            nextScore = null;
        }


        return new SliceResponseDto(dtoList, hasNext, nextCursor, nextScore);
    }

    /**
     * 댓글 채택
     */
    @Transactional
    public boolean selectReply(Long replyId, Long boardId, Long userId) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("답글을 찾을 수 없습니다."));
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시글을 찾을 수 없습니다."));;
        User loginUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다."));

        if (loginUser != board.getWriter()) {
            throw new WriterNotMatchException("권한이 없습니다."); // 에러 목록 추가사항
        }

        if(board.isSelected()) {
            throw new ReplyAlreadyAcceptedException("이미 채택된 댓글이 있습니다.");
        }

        reply.setSelected(true);
        return true;
    }

    /**
     * 댓글 추천 누르기
     */
    @Transactional
    public VoteType voteReply(Long replyId, Long userId) {
        User voteUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다."));
        Reply targetReply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("답글을 찾을 수 없습니다."));

        Optional<ReplyVote> existVote = replyVoteRepository.findByReplyAndUser(targetReply, voteUser);

        if (existVote.isPresent()){
            ReplyVote replyVote = existVote.get();
            if (replyVote.isVoted()) {
                replyVoteRepository.delete(replyVote);
                return VoteType.CANCEL;
            }
            else {
                replyVote.setVoted(true);
                return VoteType.UP;
            }
        }else {
            replyVoteRepository.save(new ReplyVote(voteUser, targetReply, true));
            return VoteType.UP;
        }
    }

    /**
     * 댓글 비추천 누르기
     */
    @Transactional
    public VoteType downVoteReply(Long replyId, Long userId) {
        User voteUser =userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다."));
        Reply targetReply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("답글을 찾을 수 없습니다."));

        Optional<ReplyVote> existVote =  replyVoteRepository.findByReplyAndUser(targetReply, voteUser);
        // 이전 값 여부 확인
        if (existVote.isPresent()) {
            ReplyVote replyVote = existVote.get();

            // 이미 비추천상태에서 클릭한 경우 취소처리
            if(!replyVote.isVoted()) {
                replyVoteRepository.delete(replyVote);
                return VoteType.CANCEL;
            } else {
                // 추천상태에서 비추천으로 바꿈
                replyVote.setVoted(false);
                return VoteType.DOWN;
            }
        } else {
            replyVoteRepository.save(new ReplyVote(voteUser, targetReply, false));
            return VoteType.DOWN;
        }
    }

    /**
     * 채택된 댓글만 조회
     */
    @Transactional(readOnly = true)
    public ResponseReplyDto getSelectedReply(Long boardId) {
        boardRepository.findById(boardId)
                .orElseThrow(() -> new BoardNotFoundException("게시물을 찾을 수 없습니다."));

        Reply reply = replyRepository.findByBoardIdAndIsSelectedTrue(boardId)
                .orElseThrow(() -> new ReplyNotFoundException("채택된 댓글이 없습니다."));

        return ResponseReplyDto.from(reply);
    }
}
