using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace MyApp.Namespace
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ILogger<AuthController> _logger;

        public AuthController(ILogger<AuthController> logger)
        {
            _logger = logger;
        }

        // Add a get method called "userdata" that returns the user's data
        [HttpGet("userdata")]
        [Authorize]
        public string UserData()
        {
            // Return response with "test" as the body
            return JsonConvert.SerializeObject(new { test = "test" });
        }
    }
}
