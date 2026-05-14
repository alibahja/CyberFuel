using Microsoft.EntityFrameworkCore;
using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public class PhotoAnalysisRepo : IPhotoAnalysisRepo
    {
        private readonly NutritionDbContext _context;

        public PhotoAnalysisRepo(NutritionDbContext context)
        {
            _context = context;
        }

        public async Task<PhotoAnalysis> CreateAsync(PhotoAnalysis analysis)
        {
            _context.PhotoAnalyses.Add(analysis); // Fixed: AnalysesPhoto → PhotoAnalyses
            await _context.SaveChangesAsync();
            return analysis;
        }

        public async Task<PhotoAnalysis?> GetByIdAsync(int id)
        {
            return await _context.PhotoAnalyses // Fixed: AnalysesPhoto → PhotoAnalyses
                .FirstOrDefaultAsync(p => p.PhotoAnalysisId == id);
        }

        public async Task<List<PhotoAnalysis>> GetUserAnalysesAsync(int userId)
        {
            return await _context.PhotoAnalyses // Fixed: AnalysesPhoto → PhotoAnalyses
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<PhotoAnalysis> UpdateAsync(PhotoAnalysis analysis)
        {
            _context.PhotoAnalyses.Update(analysis); // Fixed: AnalysesPhoto → PhotoAnalyses
            await _context.SaveChangesAsync();
            return analysis;
        }
    }
}