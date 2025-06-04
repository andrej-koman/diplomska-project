using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using diplomska.Server.Services;
using diplomska.Server.Models;

namespace diplomska.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;
        private readonly TwoFactorCodeService _twoFactorCodeService;        public AuthController(
            ILogger<AuthController> logger,
            SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager,
            IEmailService emailService,
            TwoFactorCodeService twoFactorCodeService)
        {
            _logger = logger;
            _signInManager = signInManager;
            _userManager = userManager;
            _emailService = emailService;
            _twoFactorCodeService = twoFactorCodeService;
        }
        [HttpGet("userdata")]
        [Authorize]
        public async Task<IActionResult> UserData()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { message = "Uporabnik ni najden." });
            }            return Ok(new
            {
                userId = user.Id,
                userName = user.UserName,
                email = user.Email,
                emailConfirmed = user.EmailConfirmed,
                phoneNumber = user.PhoneNumber,
                twoFactorEnabled = user.TwoFactorEnabled,
                emailTwoFactorEnabled = user.EmailTwoFactorEnabled,
                authenticatorTwoFactorEnabled = user.AuthenticatorTwoFactorEnabled
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
        [HttpPost("toggle-email-2fa")]
        [Authorize]
        public async Task<IActionResult> ToggleEmail2FA([FromBody] ToggleEmail2FARequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { message = "Uporabnik ni najden." });
            }

            user.EmailTwoFactorEnabled = request.Enable;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                _logger.LogInformation($"User {user.Email} {(request.Enable ? "enabled" : "disabled")} email 2FA.");
                return Ok(new
                {
                    message = $"Email 2FA {(request.Enable ? "omogočena" : "onemogočena")} uspešno.",
                    emailTwoFactorEnabled = request.Enable
                });
            }

            return BadRequest(new { message = "Posodabljanje email 2FA nastavitve ni uspelo.", errors = result.Errors });
        }
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out successfully.");
            return Ok(new { message = "Odjava uspešna" });
        }    }

    public class Toggle2FARequest
    {
        public bool Enable { get; set; }
    }

    public class ToggleEmail2FARequest
    {
        public bool Enable { get; set; }
    }
}
