using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Options;
using diplomska.Server.Models;

namespace diplomska.Server.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_emailSettings.FromName, _emailSettings.FromEmail));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = body
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(_emailSettings.SmtpHost, _emailSettings.SmtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {Email}", toEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                return false;
            }
        }

        public async Task<bool> Send2FACodeAsync(string toEmail, string code)
        {
            var subject = "Vaša 2FA koda - Diplomska App";
            var body = $@"
                <html>
                <body>
                    <h2>Dvojna avtentikacija</h2>
                    <p>Vaša koda za dvojno avtentikacijo je:</p>
                    <h1 style='background-color: #f0f0f0; padding: 20px; text-align: center; font-family: monospace; letter-spacing: 5px;'>{code}</h1>
                    <p>Ta koda je veljavna 5 minut.</p>
                    <p>Če se niste poskušali prijaviti, prosimo ignorirajte to sporočilo.</p>
                    <br>
                    <p>Lep pozdrav,<br>Diplomska App</p>
                </body>
                </html>";

            return await SendEmailAsync(toEmail, subject, body);
        }
    }
}
