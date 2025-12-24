package return7.boardbackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import return7.boardbackend.dto.user.NicknameChangeRequest;
import return7.boardbackend.dto.user.PasswordChangeRequest;
import return7.boardbackend.dto.user.UserResponse;
import return7.boardbackend.dto.user.UserSignupRequest;
import return7.boardbackend.entity.User;
import return7.boardbackend.exception.NotMatchPasswordException;
import return7.boardbackend.exception.UserAlreadyExistsException;
import return7.boardbackend.exception.UserNotFoundException;
import return7.boardbackend.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**회원가입*/
    public Long signup(UserSignupRequest request) {
        if(userRepository.existsByLoginId(request.getLoginId())) {
            throw new UserAlreadyExistsException("이미 사용중인 ID입니다.");
        }
        if(userRepository.existsByNickName(request.getNickName())) {
            throw new UserAlreadyExistsException("이미 사용중인 닉네임입니다.");
        }
        User user = User.builder()
                .loginId(request.getLoginId())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickName(request.getNickName())
                .email(request.getEmail())
                .build();

        userRepository.save(user);
        return user.getId();

    }

    /** 내 정보 조회*/
    @Transactional(readOnly = true)
    public UserResponse getMyInfo(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()->new UserNotFoundException("유저가 존재하지 않습니다"));

        return UserResponse.from(user);


    }

    /**닉네임 변경 */
    @Transactional
    public void changeNickname(Long userId, NicknameChangeRequest request) {
        User user = userRepository.findById(userId).orElseThrow(()->new UserNotFoundException("유저가 존재하지 않습니다."));

        if(userRepository.existsByNickName(request.getNewNickname())) {
            throw new UserAlreadyExistsException("이미 사용중인 닉네임입니다.");
        }
        user.updateNickName(request.getNewNickname());
    }



    /** 비밀번호 변경*/
    @Transactional(readOnly = true)
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId).orElseThrow(()->new UserNotFoundException("유저가 존재하지 않습니다."));

        if(!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {
            throw new NotMatchPasswordException("현재 비밀번호가 일치하지 않습니다.");
        }
        passwordEncoder.encode(request.getNewPassword());
    }

}
