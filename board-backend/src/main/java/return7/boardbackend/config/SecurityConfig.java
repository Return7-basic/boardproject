package return7.boardbackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import return7.boardbackend.security.CustomOauthSuccessHandler;
import return7.boardbackend.security.principal.CustomOAuth2UserService;
import return7.boardbackend.security.principal.CustomUserDetailsService;

@EnableWebSecurity
@RequiredArgsConstructor
@Configuration
public class SecurityConfig {
    private final CustomUserDetailsService userDetailsService;
    private final CustomOAuth2UserService oAuth2UserService;
    private final CustomOauthSuccessHandler oauthSuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())//로그인,회원가입 테스트-토큰방식or다시키기

                // 권한설정
                .authorizeHttpRequests(auth -> auth//회원가입,로그인요청 인증없이
                        .requestMatchers("/api/users/signup").permitAll()
                        .requestMatchers("/login/**").permitAll()
                        .anyRequest().authenticated()//그외 로그인필요
                )

                // Form Login-security가 customprincipal로인증처리
                .formLogin(form -> form
                        .loginProcessingUrl("/login")//POST /login
                        .usernameParameter("loginId")//loginId값+비밀번호 필드명사용
                        .passwordParameter("password")
                )

                // OAuth Login-구조만잡아두기(회원가입처리)
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo ->
                                userInfo.userService(oAuth2UserService)
                        )
                        .successHandler(oauthSuccessHandler)
                )

                // UserDetailsService
                .userDetailsService(userDetailsService);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
