package return7.boardbackend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import return7.boardbackend.entity.User;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class CustomUserDetails implements UserDetails {
    private final User user;
    public CustomUserDetails(User user) {
        this.user = user;
    }

    public Long getUserId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 기본 역할 지정
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_USER")
        );
    }

    @Override
    public String getPassword() {
        //
        return user.getPassword() != null ? user.getPassword() : "";
    }

    @Override
    public String getUsername() {
        return user.getLoginId() != null ? user.getLoginId() : "이메일 대체 예정";
        // user.getEmail().split("@")[0]
    }

    @Override
    public boolean isAccountNonExpired() {
        // 계정 만료 여부 항상 활성화
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // 자격 증명 만료 유효
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // 계정 잠금 임시 비활성
        return true;
    }
}
