package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.dto.user.UserResponse;
import return7.boardbackend.security.principal.CustomPrincipal;
import return7.boardbackend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;

    /** 유저 삭제 (관리자가 특정 유저 삭제) */
    @DeleteMapping("/{userId}/delete")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal CustomPrincipal principal
    ) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    /** 모든 유저 조회 */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
