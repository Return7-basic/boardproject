package return7.boardbackend.security.oauth;

import java.util.Map;
import java.util.UUID;

@SuppressWarnings("unchecked")
public class KakaoOauthUserInfo implements OauthUserInfo {

    private final Object id;
    private final Map<String, Object> kakaoAccount;
    private final Map<String, Object> profile;

    private String nickname = "user_" + UUID.randomUUID().toString().substring(0,5);

    public KakaoOauthUserInfo(Map<String, Object> attributes) {
        this.id = attributes.get("id");
        this.kakaoAccount =
                (Map<String, Object>) attributes.get("kakao_account");
        // kakaoAccount가 null일 수 있으므로 null 체크
        if (this.kakaoAccount != null) {
            this.profile =
                    (Map<String, Object>) kakaoAccount.get("profile");
        } else {
            this.profile = null;
        }
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
        // kakaoAccount가 null이거나 email이 없을 수 있음
        if (kakaoAccount == null) {
            return null;
        }
        return (String) kakaoAccount.get("email");
    }

    @Override
    public String getName() {
        // profile이 null일 수 있으므로 null 체크
        if (profile != null && profile.get("nickname") != null) {
            return (String) profile.get("nickname");
        }
        return nickname;
    }
}


