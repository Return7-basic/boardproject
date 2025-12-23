package return7.boardbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import return7.boardbackend.repository.ReplyRepository;

@Service
@RequiredArgsConstructor
public class ReplyService {
    private final ReplyRepository replyRepository;
}
