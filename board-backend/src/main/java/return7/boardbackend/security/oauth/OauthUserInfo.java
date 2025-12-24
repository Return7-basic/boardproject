package return7.boardbackend.security.oauth;

public interface OauthUserInfo {
    String getProvider();
    String getProviderId();
    String getEmail();
    String getName();
}
