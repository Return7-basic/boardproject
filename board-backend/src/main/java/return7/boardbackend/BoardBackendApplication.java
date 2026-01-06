package return7.boardbackend;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import return7.boardbackend.entity.User;
import return7.boardbackend.enums.Authority;
import return7.boardbackend.repository.UserRepository;

@Slf4j
@SpringBootApplication
public class BoardBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BoardBackendApplication.class, args);
	}

    @Bean
    public CommandLineRunner commandLineRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return (args) -> {
            if (!userRepository.existsByLoginId("admin")) {
                User user = User.builder()
                        .loginId("admin")
                        .password(passwordEncoder.encode("admin1234"))
                        .nickname("admin")
                        .authority(Authority.ADMIN)
                        .build();

                userRepository.save(user);
                log.info("admin has been saved");

                User savedUser = userRepository.findByLoginId("admin").orElseThrow();
                log.info(savedUser.toString());
            }
        };
    }
}