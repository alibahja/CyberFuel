namespace NutritionAppApi.DTOs
{
    public class RegisterRequestDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; } 
        public required string Password { get; set; }
    }

    public class LoginRequestDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class AuthResponseDto
    {
        public int UserId { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Token { get; set; }
        public bool HasCompletedProfile { get; set; }
    }
}