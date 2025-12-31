package return7.boardbackend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import return7.boardbackend.security.principal.CustomPrincipal;

import java.io.IOException;

@Component
public class CustomOauthSuccessHandler implements AuthenticationSuccessHandler {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        // 인증 정보 타입 확인
        Object principal = authentication.getPrincipal();
        // CustomPrincipal 타입이 아닌 경우 예외 처리
        if (!(principal instanceof CustomPrincipal)) {
            response.sendError(
                HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                "인증 정보 형식이 올바르지 않습니다."
            );
            return;
        }
        
        // 프론트엔드 URL로 리다이렉트
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/")
                .queryParam("login", "success")
                .build()
                .toUriString();
        
        response.sendRedirect(redirectUrl);
    }
}
