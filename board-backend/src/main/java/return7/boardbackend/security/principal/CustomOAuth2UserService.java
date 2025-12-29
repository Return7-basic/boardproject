package return7.boardbackend.security.principal;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import return7.boardbackend.entity.User;
import return7.boardbackend.enums.Authority;
import return7.boardbackend.repository.UserRepository;
import return7.boardbackend.security.oauth.OauthUserInfo;
import return7.boardbackend.security.oauth.OauthUserInfoFactory;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        OauthUserInfo oauthUserInfo = OauthUserInfoFactory.create(
                userRequest.getClientRegistration().getRegistrationId(),
                oAuth2User.getAttributes()
            );

        // User 조회 또는 생성 (provider_providerId로 조회)
        User user = getOrCreateUser(oauthUserInfo);

        return new CustomPrincipal(user, oAuth2User.getAttributes());
    }

    /**
     * OAuth 사용자 정보를 이용해 User 생성 또는 조회
     */
    private User getOrCreateUser(OauthUserInfo oauthUserInfo) {
        String provider = oauthUserInfo.getProvider();
        String providerId = oauthUserInfo.getProviderId();
        String loginId = provider + "_" + providerId;
        
        // 닉네임 x - loginId로 조회
        User user = userRepository.findByLoginId(loginId).orElse(null);

        // 사용자가 없으면 새로 생성
        if (user == null) {
            // 닉네임은 20자 제한을 고려하여 생성
            String prevName = provider + "유저_";
            int leftLength = 20 - prevName.length();
            
            String nextName = providerId;
            if (nextName.length() > leftLength) {
                nextName = providerId.substring(providerId.length() - leftLength);
            }
            
            String nickName = prevName + nextName;
            
            // 랜덤 UUID 활용 비밀번호 지정
            String encodedPassword = passwordEncoder.encode(UUID.randomUUID().toString());

            user = User.builder()
                    .loginId(loginId)
                    .password(encodedPassword)
                    .nickName(nickName)
                    .authority(Authority.USER)
                    .email(oauthUserInfo.getEmail() != null ? oauthUserInfo.getEmail() : "이메일 없음") // null 가능성 있음
                    .build();

            user = userRepository.save(user);
        }

        return user;
    }
}
