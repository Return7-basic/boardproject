package return7.boardbackend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomOauthSuccessHandler implements AuthenticationSuccessHandler {

    /**
     * url에서 oauth 제공자(provider) 스트링 추출
     */
    private String extractProviderFromUri(String uri) {
        // uri가 없거나 공백이면 처리 불가
        if(uri == null || uri.isBlank()) return null;

        // /login/oauth2/code/{registrationId}
        int idx = uri.indexOf("/login/oauth2/code/");
        if (idx == -1) return null;

        // "/login/oauth2/code/" 이후의 문자열이 provider
        String provider = uri.substring(idx + "/login/oauth2/code/".length());

        // 혹시 마지막에 / 가 붙어있다면 제거
        if (provider.endsWith("/")) {
            provider = provider.substring(0, provider.length() - 1);
        }
        return provider;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        // 어떤 소셜로 로그인했는지 추출
        String requestURI = request.getRequestURI();
        String provider = extractProviderFromUri(requestURI);

        // 정병천 - 추후로직 고민중

    }
}
