package return7.boardbackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import return7.boardbackend.security.CustomOauthSuccessHandler;
import return7.boardbackend.security.principal.CustomOAuth2UserService;
import return7.boardbackend.security.principal.CustomUserDetailsService;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final CustomUserDetailsService userDetailsService;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOauthSuccessHandler customOauthSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{
        httpSecurity
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth

                        //비로그인 허용 - 조회만 가능
                        .requestMatchers(HttpMethod.GET, "/api/boards/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/boards/*/replies").permitAll()

                        //로그인 페이지 OAuth
                        .requestMatchers("/", "/login/**", "/oauth2/**").permitAll()

                        //회원가입 페이지
                        .requestMatchers(HttpMethod.POST, "/api/users/signup").permitAll()

                        //USER 권한
                        .requestMatchers(HttpMethod.POST, "/api/boards/**").hasRole("USER")
                        .requestMatchers(HttpMethod.PUT, "/api/boards/**").hasRole("USER")

                        .requestMatchers(HttpMethod.POST, "/api/boards/*/replies/**").hasRole("USER")
                        .requestMatchers(HttpMethod.PATCH, "/api/boards/*/replies/**").hasRole("USER")

                        //ADMIN 권한
                        .requestMatchers(HttpMethod.DELETE, "/api/boards/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/boards/*/replies/**").hasRole("ADMIN")
                        //그 외 모든 요청 로그인 필요
                        .anyRequest().authenticated()
                )


                // 자체 로그인
                .formLogin(form -> form
                        .loginProcessingUrl("/login")
                        .usernameParameter("loginId")
                        .passwordParameter("password")
                        .defaultSuccessUrl("/api/boards"))

                // oauth2 로그인 (Google, Naver, Kakao)
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService)
                        )
                        // .defaultSuccessUrl("/", true)
                        .successHandler(customOauthSuccessHandler)
                )

                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                )

                .userDetailsService(userDetailsService);
        return httpSecurity.build();
    }

    // CORS 설정 (frontend작업 시 수정 예정)
    @Bean
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        corsConfiguration.setAllowedOrigins(List.of("http://localhost:3000"));
        corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        corsConfiguration.setAllowedHeaders(List.of("*"));
        corsConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }

}
