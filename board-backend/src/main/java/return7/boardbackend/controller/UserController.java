package return7.boardbackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import return7.boardbackend.dto.user.NicknameChangeRequest;
import return7.boardbackend.dto.user.PasswordChangeRequest;
import return7.boardbackend.dto.user.UserResponse;
import return7.boardbackend.dto.user.UserSignupRequest;
import return7.boardbackend.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    /** 회원가입*/
    @PostMapping("/signup")
    public ResponseEntity<Long> signup(@RequestBody UserSignupRequest request){
        Long userId=userService.signup(request);
        return ResponseEntity.ok(userId);
    }

    /** 내 정보 조회 (임시:userid를 직접전달)*/
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long userId){
        return ResponseEntity.ok(userService.getMyInfo(userId));
    }
// 예시코드
    //@GetMapping("/me")
    //public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserPrincipal principal){
    // return ResponseEntity.ok(userService.getMyInfo(principal.getUserID()));}

    //임시 userId로받음
    @PatchMapping("/{userId}/nickname")//@PatchMapping("/me/nickname")
    public ResponseEntity<Void> changeNickname(
            @PathVariable Long userId,//@AuthenticationPrincipal UserPrincipal principal,
            @RequestBody NicknameChangeRequest request){
        userService.changeNickname(userId,request);//userService.changeNickname(principal.getUserId(),request);
        return ResponseEntity.ok().build();
    }

    //임시 비밀번호
    @PatchMapping("/{userId}/password")//PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long userId,//@AuthenticationPrincipal UserPrincipal principal,
            @RequestBody PasswordChangeRequest request
    ) {
        userService.changePassword(userId, request);//userService.changePassword(principal.getUSerId(),request);
        return ResponseEntity.ok().build();
    }



}
