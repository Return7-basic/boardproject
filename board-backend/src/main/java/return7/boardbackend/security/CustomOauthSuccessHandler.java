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
        
        // 세션에서 신규 OAuth 회원 여부 확인
        Boolean isNewOAuthUser = (Boolean) request.getSession().getAttribute("isNewOAuthUser");
        
        String redirectUrl;
        if (Boolean.TRUE.equals(isNewOAuthUser)) {
            // 신규 회원인 경우 닉네임 설정 페이지로 리다이렉트
            redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                    .path("/oauth-edit")
                    .queryParam("login", "success")
                    .build()
                    .toUriString();
            // 세션에서 플래그 제거 (한 번만 사용)
            request.getSession().removeAttribute("isNewOAuthUser");
        } else {
            // 기존 회원인 경우 메인 페이지로 리다이렉트
            redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                    .path("/")
                    .queryParam("login", "success")
                    .build()
                    .toUriString();
        }
        
        response.sendRedirect(redirectUrl);
    }
}
