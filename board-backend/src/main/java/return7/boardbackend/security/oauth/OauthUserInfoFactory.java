package return7.boardbackend.security.oauth;

import java.util.Map;

public class OauthUserInfoFactory {
    public static OauthUserInfo create(
            String provider,
            Map<String, Object> attributes
    ){
        return switch (provider) {
            case "google" -> new GoogleOauthUserInfo(attributes);
            case "naver" -> new NaverOauthUserInfo(attributes);
            case "kakao" -> new KakaoOauthUserInfo(attributes);
            default -> throw new IllegalArgumentException(
                    "지원되지 않는 Oauth 제공자" + provider
            );
        };
    }
}
