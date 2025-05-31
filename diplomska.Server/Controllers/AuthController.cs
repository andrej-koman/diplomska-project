using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace diplomska.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;

        public AuthController(
            ILogger<AuthController> logger,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager)
        {
            _logger = logger;
            _signInManager = signInManager;
            _userManager = userManager;
        }

        [HttpGet("userdata")]
        [Authorize]
        public async Task<IActionResult> UserData()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(new
            {
                userId = user.Id,
                userName = user.UserName,
                email = user.Email,
                emailConfirmed = user.EmailConfirmed,
                phoneNumber = user.PhoneNumber
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out successfully.");
            return Ok(new { message = "Logged out successfully" });
        }
    }
}
