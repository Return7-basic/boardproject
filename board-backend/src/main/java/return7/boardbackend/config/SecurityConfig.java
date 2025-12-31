package return7.boardbackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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
                        .requestMatchers("/api/users/signup").permitAll()

                        //회원가입 페이지
                        .requestMatchers(HttpMethod.POST, "/api/users/signup").permitAll()

                        //USER 권한
                        .requestMatchers(HttpMethod.GET, "/api/users/**").hasRole("USER")
                        .requestMatchers(HttpMethod.POST, "/api/boards/**").hasRole("USER")
                        .requestMatchers(HttpMethod.PUT, "/api/boards/**").hasRole("USER")
                        .requestMatchers(HttpMethod.DELETE, "/api/boards/*").hasRole("USER")

                        .requestMatchers(HttpMethod.POST, "/api/boards/*/replies/**").hasRole("USER")
                        .requestMatchers(HttpMethod.PATCH, "/api/boards/*/replies/**").hasRole("USER")
                        .requestMatchers(HttpMethod.DELETE, "/api/boards/*/replies/*").hasRole("USER")

                        //ADMIN 권한
                        .requestMatchers("/api/**").hasRole("ADMIN")

                        //그 외 모든 요청 로그인 필요
                        .anyRequest().authenticated()
                )

                // 자체 로그인 (SPA용 JSON 응답)
                .formLogin(form -> form
                        .loginProcessingUrl("/login")
                        .usernameParameter("loginId")
                        .passwordParameter("password")
                        .successHandler((request, response, authentication) -> {
                            response.setStatus(200);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"success\":true}");
                        })
                        .failureHandler((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"success\":false,\"message\":\"" + exception.getMessage() + "\"}");
                        }))

                // API 요청에 대해 401 JSON 응답 (로그인 페이지 리다이렉트 대신)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"로그인이 필요합니다.\"}");
                        })
                )

                // oauth2 로그인 (Google, Naver, Kakao)
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService)
                        )
                        // .defaultSuccessUrl("/", true)
                        .successHandler(customOauthSuccessHandler)
                )

                .cors(cors->cors.configurationSource(corsConfigurationSource()))

                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(200);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"success\":true}");
                        })
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