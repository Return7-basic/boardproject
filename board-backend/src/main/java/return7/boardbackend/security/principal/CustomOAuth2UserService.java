package return7.boardbackend.security.principal;

import java.nio.ByteBuffer;
import java.util.Base64;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import return7.boardbackend.entity.User;
import return7.boardbackend.enums.Authority;
import return7.boardbackend.repository.UserRepository;
import return7.boardbackend.security.oauth.OauthUserInfo;
import return7.boardbackend.security.oauth.OauthUserInfoFactory;

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
            // 신규 가입인 경우 세션에 속성값 저장
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                attributes.getRequest().getSession().setAttribute("isNewOAuthUser", true);
            }
            UUID uuid = UUID.randomUUID();
            // UUID를 Base64로 인코딩하여 닉네임 생성
            String nickname = nickNameBase64(uuid);
            // UUID 자체 비밀번호 지정
            String encodedPassword = passwordEncoder.encode(uuid.toString());

            user = User.builder()
                    .loginId(loginId)
                    .password(encodedPassword)
                    .nickname(nickname)
                    .authority(Authority.USER)
                    .email(oauthUserInfo.getEmail())
                    .build();

            user = userRepository.save(user);
        }

        return user;
    }

    /**
     * UUID를 Base64로 인코딩하여 닉네임 생성 (22자리 고정)
     */
    private String nickNameBase64(UUID uuid) {

        // 16byte 크기 버퍼 생성
        ByteBuffer buffer = ByteBuffer.allocate(16);

        // UUID는 long 2개로 구성됨 (128bit)
        buffer.putLong(uuid.getMostSignificantBits());
        buffer.putLong(uuid.getLeastSignificantBits());

        // Base64 인코딩
        return Base64.getUrlEncoder()
                     .withoutPadding()
                     .encodeToString(buffer.array());
    }
}
