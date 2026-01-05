package return7.boardbackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
// import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        // SimpleMailMessage msg = new SimpleMailMessage();
        // msg.setTo(to);
        // msg.setSubject(subject);
        // msg.setText(text);
        // mailSender.send(msg);
        
        // html 형식 메일로 변경
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            // true → HTML 메일
            helper.setText(text, true);
            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            throw new RuntimeException("전송실패 :: " + e.getMessage());
        }
    }
}