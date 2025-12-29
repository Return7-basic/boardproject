package return7.boardbackend.security.principal;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import return7.boardbackend.entity.User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class CustomPrincipal implements UserDetails, OAuth2User {
    private final User user;
    private Map<String, Object> attributes;

    public CustomPrincipal(User user) {
        this.user = user;
    }

    public CustomPrincipal(User user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }
    public Long getUserId() {
        return user.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getAuthority()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getNickName();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    // 식별자
    @Override
    public String getName() {
        return user.getId().toString();
    }
}
