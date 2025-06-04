using Microsoft.AspNetCore.Identity;

namespace diplomska.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        public bool EmailTwoFactorEnabled { get; set; } = false;
        public bool AuthenticatorTwoFactorEnabled { get; set; } = false;
    }
}