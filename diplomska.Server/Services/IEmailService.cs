namespace diplomska.Server.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string body);
        Task<bool> Send2FACodeAsync(string toEmail, string code);
    }
}
