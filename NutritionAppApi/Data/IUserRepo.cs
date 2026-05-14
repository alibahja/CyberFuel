using NutritionAppApi.Models;
namespace NutritionAppApi.Data
{

    public interface IUserRepo
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task AddAsync(User user);
    
    }
}