using System.ComponentModel.DataAnnotations;

namespace NutritionAppApi.DTOs
{
    public class WeightLogRequestDto
    {
        [Required]
        [Range(30, 300)]
        public float Weight { get; set; }
        
        public DateTime Date { get; set; } = DateTime.UtcNow.Date;
        
        public string? Notes { get; set; }
        
        [Range(5, 60)]
        public float? BodyFatPercentage { get; set; }
        
        [Range(20, 200)]
        public float? MuscleMass { get; set; }
        
        [Range(50, 150)]
        public float? WaistCircumference { get; set; }
    }

    public class WeightLogResponseDto
    {
        public int WeightLogId { get; set; }
        public float Weight { get; set; }
        public DateTime Date { get; set; }
        public string? Notes { get; set; }
        public float? BodyFatPercentage { get; set; }
        public float? MuscleMass { get; set; }
        public float? WaistCircumference { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ProgressSummaryDto
    {
        public WeightLogResponseDto? CurrentWeight { get; set; }
        public WeightLogResponseDto? StartingWeight { get; set; }
        public float? TotalChange { get; set; } // kg lost/gained
        public float? AverageWeeklyChange { get; set; }
        public List<WeightLogResponseDto> RecentLogs { get; set; } = new();
        public string? Trend { get; set; } // "Losing", "Gaining", "Maintaining"
    }
}