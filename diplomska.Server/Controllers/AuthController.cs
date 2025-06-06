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
        private readonly TwoFactorCodeService _twoFactorCodeService; public AuthController(
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
            }
            return Ok(new
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
        [HttpPost("test-email")]
        [Authorize]
        public async Task<IActionResult> TestEmail()
        {
            _logger.LogInformation("Test email endpoint called");

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                _logger.LogWarning("User not found in test email endpoint");
                return NotFound(new { message = "Uporabnik ni najden." });
            }

            _logger.LogInformation($"User found: {user.Email}");

            if (string.IsNullOrEmpty(user.Email))
            {
                _logger.LogWarning("User has no email address");
                return BadRequest(new { message = "Uporabnik nima nastavljenega email naslova." });
            }

            try
            {
                _logger.LogInformation("Generating test 2FA code");
                var testCode = _twoFactorCodeService.GenerateCode();
                _logger.LogInformation($"Generated code: {testCode}");

                _logger.LogInformation($"Attempting to send email to: {user.Email}");
                // Send test email
                var emailSent = await _emailService.Send2FACodeAsync(user.Email, testCode);

                if (emailSent)
                {
                    _logger.LogInformation($"Test email sent successfully to {user.Email}");
                    return Ok(new
                    {
                        message = "Test email uspešno poslan!",
                        email = user.Email,
                        code = testCode
                    });
                }
                else
                {
                    _logger.LogError($"Failed to send test email to {user.Email}");
                    return BadRequest(new { message = "Pošiljanje test emaila ni uspelo." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending test email to {user.Email}");
                return StatusCode(500, new { message = "Napaka pri pošiljanju test emaila.", error = ex.Message });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out successfully.");
            return Ok(new { message = "Odjava uspešna" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            _logger.LogInformation($"Login attempt for email: {request.Email}");

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning($"User not found for email: {request.Email}");
                return BadRequest(new { message = "Neveljavni podatki za prijavo." });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
            {
                _logger.LogWarning($"Invalid password for user: {request.Email}");
                return BadRequest(new { message = "Neveljavni podatki za prijavo." });
            }

            // Check if user has 2FA enabled and specifically email 2FA
            if (user.TwoFactorEnabled && user.EmailTwoFactorEnabled)
            {
                _logger.LogInformation($"User {request.Email} has email 2FA enabled, sending verification code");

                // Generate and store 2FA code
                var code = _twoFactorCodeService.GenerateCode();
                _twoFactorCodeService.StoreCode(user.Id, code);

                // Send email with 2FA code
                var emailSent = await _emailService.Send2FACodeAsync(user.Email!, code);

                if (!emailSent)
                {
                    _logger.LogError($"Failed to send 2FA email to {user.Email}");
                    return StatusCode(500, new { message = "Napaka pri pošiljanju 2FA kode." });
                }

                return Ok(new
                {
                    requiresEmailTwoFactor = true,
                    email = user.Email,
                    message = "2FA koda je bila poslana na vaš email."
                });
            }

            // If no 2FA required, sign in the user normally
            await _signInManager.SignInAsync(user, request.RememberMe);
            _logger.LogInformation($"User {request.Email} logged in successfully");

            return Ok(new
            {
                success = true,
                user = new
                {
                    userId = user.Id,
                    userName = user.UserName,
                    email = user.Email,
                    emailConfirmed = user.EmailConfirmed,
                    phoneNumber = user.PhoneNumber,
                    twoFactorEnabled = user.TwoFactorEnabled,
                    emailTwoFactorEnabled = user.EmailTwoFactorEnabled,
                    authenticatorTwoFactorEnabled = user.AuthenticatorTwoFactorEnabled
                }
            });
        }

        [HttpPost("verify-email-2fa")]
        public async Task<IActionResult> VerifyEmail2FA([FromBody] VerifyEmail2FARequest request)
        {
            _logger.LogInformation($"Email 2FA verification attempt for: {request.Email}");

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning($"User not found for email: {request.Email}");
                return BadRequest(new { message = "Uporabnik ni najden." });
            }

            // Validate the 2FA code
            var isValidCode = _twoFactorCodeService.ValidateCode(user.Id, request.Code);
            if (!isValidCode)
            {
                _logger.LogWarning($"Invalid 2FA code provided for user: {request.Email}");
                return BadRequest(new { message = "Neveljavna ali potekla 2FA koda." });
            }

            // Sign in the user
            await _signInManager.SignInAsync(user, request.RememberMe);
            _logger.LogInformation($"User {request.Email} logged in successfully after 2FA verification");

            return Ok(new
            {
                success = true,
                user = new
                {
                    userId = user.Id,
                    userName = user.UserName,
                    email = user.Email,
                    emailConfirmed = user.EmailConfirmed,
                    phoneNumber = user.PhoneNumber,
                    twoFactorEnabled = user.TwoFactorEnabled,
                    emailTwoFactorEnabled = user.EmailTwoFactorEnabled,
                    authenticatorTwoFactorEnabled = user.AuthenticatorTwoFactorEnabled
                }
            });
        }

        [HttpPost("resend-email-2fa")]
        public async Task<IActionResult> ResendEmail2FA([FromBody] ResendEmail2FARequest request)
        {
            _logger.LogInformation($"Resending email 2FA code for: {request.Email}");

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                _logger.LogWarning($"User not found for email: {request.Email}");
                return BadRequest(new { message = "Uporabnik ni najden." });
            }

            if (!user.TwoFactorEnabled || !user.EmailTwoFactorEnabled)
            {
                return BadRequest(new { message = "Email 2FA ni omogočen za tega uporabnika." });
            }

            // Generate and store new 2FA code
            var code = _twoFactorCodeService.GenerateCode();
            _twoFactorCodeService.StoreCode(user.Id, code);

            // Send email with 2FA code
            var emailSent = await _emailService.Send2FACodeAsync(user.Email!, code);

            if (!emailSent)
            {
                _logger.LogError($"Failed to resend 2FA email to {user.Email}");
                return StatusCode(500, new { message = "Napaka pri pošiljanju 2FA kode." });
            }

            return Ok(new { message = "Nova 2FA koda je bila poslana na vaš email." });
        }
    }

    public class Toggle2FARequest
    {
        public bool Enable { get; set; }
    }

    public class ToggleEmail2FARequest
    {
        public bool Enable { get; set; }
    }    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
        public bool RememberMe { get; set; }
    }

    public class VerifyEmail2FARequest
    {
        public required string Email { get; set; }
        public required string Code { get; set; }
        public bool RememberMe { get; set; }
    }

    public class ResendEmail2FARequest
    {
        public required string Email { get; set; }
    }
}
