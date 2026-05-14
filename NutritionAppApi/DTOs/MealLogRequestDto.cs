public class MealLogRequestDto
{
    public int? MealId { get; set; }
    // added a meal name field
    public string? MealName { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan Time { get; set; }
    public float LoggedCalories { get; set; }
    public bool IsFromAI { get; set; }
    public float? LoggedProtein { get; set; }
    public float? LoggedCarbs { get; set; }
    public float? LoggedFats { get; set; }
    public float? PortionMultiplier { get; set; }
}

public class MealLogResponseDto
{
    public int MealLogId { get; set; }
    //Add a name field
    public string MealName { get; set; } = string.Empty;
    public int? MealId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan Time { get; set; }
    public float LoggedCalories { get; set; }
    public bool IsFromAI { get; set; }
    public float? LoggedProtein { get; set; }
    public float? LoggedCarbs { get; set; }
    public float? LoggedFats { get; set; }
    public float? PortionMultiplier { get; set; }
    public DateTime CreatedAt { get; set; }
}