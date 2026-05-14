using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutritionAppApi.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }
        
        [Required]
        [MaxLength(256)]
        public string FullName { get; set; } = string.Empty; // Initialize with default
        
        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty; // Initialize with default
        
        [Required]
        [MaxLength(256)]
        public string PasswordHash { get; set; } = string.Empty; // Initialize with default

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? LastLogin { get; set; }

        // Navigation properties
        public virtual UserProfile? Profile { get; set; }
    }
}