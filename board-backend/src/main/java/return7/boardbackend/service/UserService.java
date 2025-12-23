package return7.boardbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import return7.boardbackend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
}
