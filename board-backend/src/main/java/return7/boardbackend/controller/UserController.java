package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.dto.user.NicknameChangeRequest;
import return7.boardbackend.dto.user.PasswordChangeRequest;
import return7.boardbackend.dto.user.UserResponse;
import return7.boardbackend.dto.user.UserSignupRequest;
import return7.boardbackend.security.principal.CustomPrincipal;
import return7.boardbackend.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    /** 회원가입 */
    @PostMapping("/signup")
    public ResponseEntity<Long> signup(@RequestBody UserSignupRequest request){
        Long userId=userService.signup(request);
        return ResponseEntity.ok(userId);
    }

    /** 내 정보 조회 */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
     @AuthenticationPrincipal CustomPrincipal principal){
     // 세션의 User 객체는 오래된 정보일 수 있으므로, DB에서 최신 정보를 조회
     return ResponseEntity.ok(userService.getMyInfo(principal.getUserId()));
    }

    /** 닉네임 변경 */
    @PatchMapping("/me/nickname")
    public ResponseEntity<Void> changeNickname(
            @AuthenticationPrincipal CustomPrincipal principal,
            @RequestBody NicknameChangeRequest request){

        userService.changeNickname(principal.getUserId(),request);
        return ResponseEntity.noContent().build();//204 No Content
    }

    /** 비밀번호 변경 */
    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal CustomPrincipal principal,
            @RequestBody PasswordChangeRequest request
    ) {
        userService.changePassword(principal.getUserId(),request);
        return ResponseEntity.noContent().build();
    }

    /** 회원 탈퇴 */
    @DeleteMapping("/me/delete")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        userService.deleteUser(principal.getUserId());
        return ResponseEntity.noContent().build();
    }

}
