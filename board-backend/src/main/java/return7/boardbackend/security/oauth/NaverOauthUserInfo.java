package return7.boardbackend.security.oauth;

import java.util.Map;

@SuppressWarnings("unchecked")
public class NaverOauthUserInfo implements OauthUserInfo {

    private final Map<String, Object> response;

    public NaverOauthUserInfo(Map<String, Object> attributes) {
        this.response = (Map<String, Object>) attributes.get("response");
    }

    @Override
    public String getProvider() {
        return "naver";
    }

    @Override
    public String getProviderId() {
        return (String) response.get("id");
    }

    @Override
    public String getEmail() {
        return (String) response.get("email");
    }

    @Override
    public String getName() {
        if (response.get("name") != null) {
            return (String) response.get("name");
        }
        return "";
    }
}
