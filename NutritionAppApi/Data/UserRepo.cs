
using Microsoft.EntityFrameworkCore;
using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
   public class UserRepo : IUserRepo
{
    private readonly NutritionDbContext _context;

    public UserRepo(NutritionDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }
}
}