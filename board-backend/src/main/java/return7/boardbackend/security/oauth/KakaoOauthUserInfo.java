package return7.boardbackend.security.oauth;

import java.util.Map;
import java.util.UUID;

@SuppressWarnings("unchecked")
public class KakaoOauthUserInfo implements OauthUserInfo {

    private final Object id;
    private final Map<String, Object> kakaoAccount;
    private final Map<String, Object> profile;

    public KakaoOauthUserInfo(Map<String, Object> attributes) {
        this.id = attributes.get("id");
        this.kakaoAccount =
                (Map<String, Object>) attributes.get("kakao_account");
        this.profile =
                (Map<String, Object>) kakaoAccount.get("profile");
    }

    @Override
    public String getProvider() {
        return "kakao";
    }

    @Override
    public String getProviderId() {
        return String.valueOf(id);
    }

    @Override
    public String getEmail() {
        return (String) kakaoAccount.get("email");
    }

    @Override
    public String getName() {
        if (profile.get("nickname") != null) {
            return (String) profile.get("nickname");
        }
        return "";
    }
}


