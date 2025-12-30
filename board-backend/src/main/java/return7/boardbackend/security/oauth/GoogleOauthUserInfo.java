package return7.boardbackend.security.oauth;

import java.util.Map;

public class GoogleOauthUserInfo implements OauthUserInfo{
    private final Map<String, Object> attributes;

    public GoogleOauthUserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }


    @Override
    public String getProvider() {
        return "google";
    }

    @Override
    public String getProviderId() {
        return (String) attributes.get("sub");
        // sub = Google OAuth에서 유저 고유 ID
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getName() {
        if (attributes.get("name") != null) {
            return (String) attributes.get("name");
        }
        return "";
    }
}
