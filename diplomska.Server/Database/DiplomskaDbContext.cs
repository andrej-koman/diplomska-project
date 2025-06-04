using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using diplomska.Server.Models;

namespace diplomska.Server.Database
{
    public class DiplomskaDbContext : IdentityDbContext<ApplicationUser>
    {
        public DiplomskaDbContext(DbContextOptions<DiplomskaDbContext> options) : base(options) { }
    }
}


