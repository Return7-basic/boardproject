package return7.boardbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import return7.boardbackend.dto.user.NicknameChangeRequest;
import return7.boardbackend.dto.user.PasswordChangeRequest;
import return7.boardbackend.dto.user.UserResponse;
import return7.boardbackend.dto.user.UserSignupRequest;
import return7.boardbackend.entity.Board;
import return7.boardbackend.entity.PasswordResetToken;
import return7.boardbackend.entity.Reply;
import return7.boardbackend.entity.User;
import return7.boardbackend.exception.NicknameNotNullException;
import return7.boardbackend.exception.NotMatchPasswordException;
import return7.boardbackend.exception.UserAlreadyExistsException;
import return7.boardbackend.exception.UserNotFoundException;
import return7.boardbackend.repository.TokenRepository;
import return7.boardbackend.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;

    /** 회원가입 */
    public Long signup(UserSignupRequest request) {
        if(userRepository.existsByLoginId(request.getLoginId())) {//loginId
            throw new UserAlreadyExistsException("이미 사용중인 ID입니다.");
        }
        if(userRepository.existsByNickname(request.getNickname())) {//NickName
            throw new UserAlreadyExistsException("이미 사용중인 닉네임입니다.");
        }
        User user = User.builder()//password+builder
                .loginId(request.getLoginId())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .email(request.getEmail())
                .build();

        userRepository.save(user);
        return user.getId();

    }

    /** 내 정보 조회 */
    @Transactional(readOnly = true)
    public UserResponse getMyInfo(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()->new UserNotFoundException("유저가 존재하지 않습니다"));

        return UserResponse.from(user);

    }

    /** 닉네임 변경 */
    @Transactional
    public void changeNickname(Long userId, NicknameChangeRequest request) {//권한 검증 security
        if(request.getNewNickname() ==null|| request.getNewNickname().isEmpty()){
            throw new NicknameNotNullException("닉네임은 비어 있을 수 없습니다");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("유저가 존재하지 않습니다."));


        if(userRepository.existsByNickname(request.getNewNickname())){
            throw new UserAlreadyExistsException("이미 사용중인 닉네임입니다.");
        }
        user.changeNickName(request.getNewNickname());
    }

    /** 비밀번호 변경 */
    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {//User에서 정보 받아오기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("유저가 존재하지 않습니다."));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {
            throw new NotMatchPasswordException("현재 비밀번호가 일치하지 않습니다.");
        }
        user.changePassword(passwordEncoder.encode(request.getNewPassword()));
    }

    /** 비밀번호 찾기 */
    @Transactional
    public void requestResetPassword(String email, Long id){
        User user = userRepository.findByEmailAndId(email, id)
                .orElseThrow(() -> new UserNotFoundException("해당 유저가 존재하지 않습니다."));

        PasswordResetToken token = tokenRepository.save(PasswordResetToken.create(user));
        String link = " 해당 링크 " + token.getToken();
        emailService.sendEmail(email, "비밀번호 재설정 링크", "아래 링크를 클릭하세요:\n" + link);

    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        // 토큰 조회
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 토큰입니다."));

        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("만료된 링크입니다. 다시 요청해주세요.");
        }

        User user = resetToken.getUser();
        user.changePassword(passwordEncoder.encode(newPassword));

        tokenRepository.findByUser(user).stream().forEach(PasswordResetToken::forceExpire);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("유저가 존재하지 않습니다."));

        for (Board board : user.getBoards()) {
            board.setUser(null);
        }

        for (Reply reply : user.getReplies()) {
            reply.setUser(null);
        }

        userRepository.deleteById(userId);
    }
}
