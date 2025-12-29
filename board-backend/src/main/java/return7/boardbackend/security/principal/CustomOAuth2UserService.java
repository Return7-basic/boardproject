package return7.boardbackend.security.principal;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import return7.boardbackend.entity.User;
import return7.boardbackend.repository.UserRepository;
import return7.boardbackend.security.oauth.OauthUserInfo;
import return7.boardbackend.security.oauth.OauthUserInfoFactory;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        OauthUserInfo oauthUserInfo = OauthUserInfoFactory.create(userRequest.getClientRegistration().getRegistrationId()
                , oAuth2User.getAttributes());

        // user정보를 oauth2info를 통해 받아오거나 저장
        User user = userRepository.findByNickName(oauthUserInfo.getName()).orElse(null);

        return new CustomPrincipal(user, oAuth2User.getAttributes());
    }
}
