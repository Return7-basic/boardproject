package return7.boardbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
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
    
    @Value("${app.frontend.url}")
    private String frontendUrl;

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
    public void requestResetPassword(String email, String loginId) {
        // 같은 이메일을 가진 사용자가 여러 명일 수 있으므로 첫 번째 사용자만 선택
        User user = userRepository.findFirstByEmailAndLoginId(email, loginId)
                .orElseThrow(() -> new UserNotFoundException("해당 이메일로 등록된 사용자가 없습니다."));

        PasswordResetToken token = tokenRepository.save(PasswordResetToken.create(user));
        // 프론트엔드 URL로 비밀번호 재설정 링크 생성
        String resetLink = frontendUrl + "/reset-password?token=" + token.getToken();

        // String emailContent = "비밀번호 재설정을 요청하셨습니다.\n\n" +
        //         "아래 링크를 클릭하여 비밀번호를 재설정하세요:\n" +
        //         resetLink + "\n" +
        //         "이 링크는 10분간 유효합니다.\n" +
        //         "만약 비밀번호 재설정을 요청하지 않으셨다면 이 메일을 무시하세요.";

        String emailContent =
                "<p>비밀번호 재설정을 요청하셨습니다.</p>" +
                "<p>아래 버튼을 클릭하여 비밀번호를 재설정하세요.</p><br/>" +
                "<a href='" + resetLink + "' " +
                "style='display:inline-block;padding:12px 24px;background:#4F46E5;" +
                "color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;'>" +
                "비밀번호 재설정하기</a><br/>" +
                "<p style='margin-top:16px;'>해당 비밀번호 재설정은 <strong>10분</strong>간 유효합니다.</p>" +
                "<p>요청하지 않으셨다면 이 메일을 무시하세요.</p>"
                ;
        
        emailService.sendEmail(email, "[@Return7 - QnA Board] 비밀번호 재설정 요청 메일 입니다.", emailContent);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        // 토큰 조회
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 토큰입니다."));

        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("만료된 링크입니다. 다시 요청해주세요.");
        }

        Long userId = resetToken.getUser().getId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        String encodedPassword = passwordEncoder.encode(newPassword);
        user.changePassword(encodedPassword);

        // LAZY 로 로딩된 엔티티가 즉시 반영안될수 있으니
        // 저장 및 플러시로 바로 반영
        userRepository.saveAndFlush(user);

        // 저장 이후 모든 토큰 만료 처리
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
