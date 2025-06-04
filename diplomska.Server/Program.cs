using diplomska.Server.Database;
using diplomska.Server.Models;
using diplomska.Server.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace diplomska.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container
            var dbPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Diplomska", "diplomska.db");
            Console.WriteLine($"Database path: {dbPath}");
#pragma warning disable CS8604 // Possible null reference argument.
            Directory.CreateDirectory(Path.GetDirectoryName(dbPath)); // Ensure the directory exists
#pragma warning restore CS8604 // Possible null reference argument.
            var connectionString = $"Data Source={dbPath};";
            builder.Services.AddDbContext<DiplomskaDbContext>(options => options.UseSqlite(connectionString));
            builder.Services.AddAuthorization();
            builder.Services.AddIdentityApiEndpoints<ApplicationUser>().AddEntityFrameworkStores<DiplomskaDbContext>();

            // Configure email settings
            builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
            
            // Register services
            builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.AddSingleton<TwoFactorCodeService>();

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");
            app.MapIdentityApi<ApplicationUser>();

            app.Run();
        }
    }
}
