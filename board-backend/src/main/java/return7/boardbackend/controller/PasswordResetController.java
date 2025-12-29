package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.dto.user.ApiResponse;
import return7.boardbackend.dto.user.PasswordResetDto;
import return7.boardbackend.dto.user.PasswordResetRequestDto;
import return7.boardbackend.security.principal.CustomPrincipal;
import return7.boardbackend.service.UserService;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/password")
public class PasswordResetController {

    private final UserService userService;

    /**
     * 비밀 번호 재 설정 요청(메일 발송*/
    @PostMapping("/request")
    public ResponseEntity<ApiResponse> request(@RequestBody PasswordResetRequestDto dto, @AuthenticationPrincipal CustomPrincipal customPrincipal) {
        userService.requestResetPassword(dto.getEmail(), customPrincipal.getUserId());
        return ResponseEntity.ok(
                new ApiResponse(true, "비밀번호 재설정 메일이 발송되었습니다.메일을 확인해주세요.")
        );
    }

    /**비밀번호 변경.*/
    @PostMapping("/reset")
    public ResponseEntity<ApiResponse> resetPassword(@RequestBody PasswordResetDto dto){
        userService.resetPassword(dto.getToken(), dto.getNewPassword());
        return ResponseEntity.ok(
                new ApiResponse(true,"비밀번호가 성공적으로 변경되었습니다.")
        );
    }
}
