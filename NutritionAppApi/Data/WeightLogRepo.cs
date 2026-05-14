using Microsoft.EntityFrameworkCore;
using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public class WeightLogRepo : IWeightLogRepo
    {
        private readonly NutritionDbContext _context;
        
        public WeightLogRepo(NutritionDbContext context)
        {
            _context = context;
        }
        
        public async Task<WeightLog> CreateAsync(WeightLog weightLog)
        {
            _context.WeightLogs.Add(weightLog); // Fixed: WeightLogged → WeightLogs
            await _context.SaveChangesAsync();
            return weightLog;
        }

        public async Task DeleteAsync(int weightLogId)
        {
            var weight = await _context.WeightLogs.FirstOrDefaultAsync(p => p.WeightLogId == weightLogId);
            if (weight == null)
            {
                throw new Exception("Weight log not found");
            }
            _context.WeightLogs.Remove(weight); // Fixed: Remove object, not ID
            await _context.SaveChangesAsync();
        }

        public async Task<WeightLog?> GetByIdAsync(int weightLogId)
        {
            return await _context.WeightLogs.FirstOrDefaultAsync(p => p.WeightLogId == weightLogId);
        }

        public async Task<WeightLog?> GetLatestWeightAsync(int userId)
        {
            return await _context.WeightLogs
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.Date)
                .ThenByDescending(w => w.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<WeightLog?> GetWeightByDateAsync(int userId, DateTime date)
        {
            return await _context.WeightLogs
                .FirstOrDefaultAsync(w => w.UserId == userId && w.Date.Date == date.Date);
        }

        public async Task<List<WeightLog>> GetWeightHistoryAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.WeightLogs
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.Date);

            if (startDate.HasValue)
                query = (IOrderedQueryable<WeightLog>)query.Where(w => w.Date >= startDate.Value.Date);

            if (endDate.HasValue)
                query = (IOrderedQueryable<WeightLog>)query.Where(w => w.Date <= endDate.Value.Date);

            return await query.ToListAsync();
        }
    }
}