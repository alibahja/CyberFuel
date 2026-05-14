using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using NutritionAppApi.Data;
using NutritionAppApi.DTOs;
using NutritionAppApi.Models;

namespace NutritionAppApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepo _userRepo;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepo userRepo, IConfiguration configuration)
        {
            _userRepo = userRepo;
            _configuration=configuration;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {    Console.WriteLine($"Login request received - Email: {request.Email}");
    Console.WriteLine($"Password length: {request.Password?.Length}");
    
    var user = await _userRepo.GetByEmailAsync(request.Email);
    Console.WriteLine($"User found: {user != null}");
    
    if (user == null)
    {
        Console.WriteLine("User not found in database");
        throw new Exception("Invalid email or password");
    }

    Console.WriteLine($"Stored hash length: {user.PasswordHash?.Length}");
    
    bool passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
    Console.WriteLine($"BCrypt verify result: {passwordValid}");
    
    if (!passwordValid)
    {
        Console.WriteLine("Password verification failed");
        throw new Exception("Invalid email or password");
    }

            user.LastLogin = DateTime.UtcNow;
            // Optional: _userRepo.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            bool hasCompletedProfile = user.Profile != null;

            return new AuthResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Token = token,
                HasCompletedProfile = hasCompletedProfile
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            if (await UserExistsAsync(request.Email))
            {
                throw new Exception("User with this email already exists");
            }

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _userRepo.AddAsync(user);

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Token = token,
                HasCompletedProfile = false
            };
        }

        private async Task<bool> UserExistsAsync(string email)
        {
            var user = await _userRepo.GetByEmailAsync(email);
            return user != null;
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
{
    new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
    new Claim(ClaimTypes.Email, user.Email),
    new Claim(ClaimTypes.Name, user.FullName)
};

var key = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(
        _configuration["Jwt:Key"] 
        ?? throw new Exception("JWT Key not configured")
    )
);

var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

var token = new JwtSecurityToken(
    issuer: _configuration["Jwt:Issuer"],
    audience: _configuration["Jwt:Audience"],
    claims: claims,
    expires: DateTime.UtcNow.AddDays(7),
    signingCredentials: creds
);

return new JwtSecurityTokenHandler().WriteToken(token); 
        }
    }
}
