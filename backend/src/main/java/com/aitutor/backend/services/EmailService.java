package com.aitutor.backend.services;

import com.aitutor.backend.configs.AppConfig;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.io.UnsupportedEncodingException;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final AppConfig appConfig;

    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            try {
                helper.setFrom(appConfig.getMailFrom(), "Recipe App");
            } catch (UnsupportedEncodingException e) {
                log.error("Ошибка кодировки имени отправителя для email: {}", toEmail, e);
                throw new RuntimeException("Ошибка кодировки имени отправителя", e);
            }
            helper.setSubject("Восстановление пароля в Recipe App");

            String resetUrl = appConfig.getFrontendBaseUrl() + "/auth/reset-password?token=" + token;

            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #4CAF50;">Восстановление пароля</h2>
                    <p>Здравствуйте! Вы запросили восстановление пароля.</p>
                    <p style="margin: 30px 0;">
                        <a href="%s" style="background-color: #4CAF50; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Восстановить пароль
                        </a>
                    </p>
                    <p style="background-color: #f4f4f4; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px;">
                        <a href="%s" style="color: #0066cc;">%s</a>
                    </p>
                    <p style="color: #666666; font-size: 14px; margin-top: 30px;">
                        Ссылка действительна в течение <strong>%d минут</strong>.
                    </p>
                </body>
                </html>
                """.formatted(resetUrl, resetUrl, resetUrl, appConfig.getPasswordResetTtlMinutes());

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("Письмо для восстановления пароля успешно отправлено на email: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Не удалось отправить письмо для восстановления пароля на email: {}", toEmail, e);
            throw new RuntimeException("Не удалось отправить письмо: " + e.getMessage(), e);
        }
    }
}