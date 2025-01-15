using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace diplomska.Server.Database
{
    public class DiplomskaDbContext : IdentityDbContext<IdentityUser>
    {
        public DiplomskaDbContext(DbContextOptions<DiplomskaDbContext> options) : base(options) { }
    }
}


