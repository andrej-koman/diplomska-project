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
                return NotFound(new { message = "Uporabnik ni najden." });
            }

            return Ok(new
            {
                userId = user.Id,
                userName = user.UserName,
                email = user.Email,
                emailConfirmed = user.EmailConfirmed,
                phoneNumber = user.PhoneNumber,
                twoFactorEnabled = user.TwoFactorEnabled
            });
        }
        [HttpPost("toggle-2fa")]
        [Authorize]
        public async Task<IActionResult> Toggle2FA([FromBody] Toggle2FARequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { message = "Uporabnik ni najden." });
            }
            var result = await _userManager.SetTwoFactorEnabledAsync(user, request.Enable);
            if (result.Succeeded)
            {
                _logger.LogInformation($"User {user.Email} {(request.Enable ? "enabled" : "disabled")} 2FA.");
                return Ok(new
                {
                    message = $"2FA {(request.Enable ? "omogočena" : "onemogočena")} uspešno.",
                    twoFactorEnabled = request.Enable
                });
            }

            return BadRequest(new { message = "Posodabljanje 2FA nastavitve ni uspelo.", errors = result.Errors });
        }
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out successfully.");
            return Ok(new { message = "Odjava uspešna" });
        }
    }

    public class Toggle2FARequest
    {
        public bool Enable { get; set; }
    }
}
