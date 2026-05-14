using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NutritionAppApi.Data;
using NutritionAppApi.Interfaces;
using NutritionAppApi.Services;
using System.Text;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using NutritionAppApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<NutritionDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 31)) // Use your MySQL version
    ));

// =======================
// Add Controllers
// =======================
builder.Services.AddControllers();

builder.Services.AddControllers();

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// Continue with other services...


// =======================
// Dependency Injection
// =======================

// Repositories
builder.Services.AddScoped<IUserRepo, UserRepo>();
builder.Services.AddScoped<IUserProfileRepo, UserProfileRepo>();
builder.Services.AddScoped<IDietPreference, DietPreferenceRepo>();
builder.Services.AddScoped<IMealLogRepo, MealLogRepo>();
builder.Services.AddScoped<IMealPlanRepo, MealPlanRepo>();
builder.Services.AddScoped<IPhotoAnalysisRepo, PhotoAnalysisRepo>();
builder.Services.AddScoped<IUserSettingsRepo, UserSettingsRepo>();
builder.Services.AddScoped<IWeightLogRepo, WeightLogRepo>();
builder.Services.AddScoped<IMealRepo, MealRepo>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IDietPreferenceService, DietPreferenceService>();
builder.Services.AddScoped<IMealLogService, MealLogService>();
builder.Services.AddScoped<IMealPlanService, MealPlanService>();
builder.Services.AddScoped<IPhotoAnalysisService, PhotoAnalysisService>();
builder.Services.AddScoped<IUserSettingsService, UserSettingsService>();
builder.Services.AddScoped<IWeightLogService, WeightLogService>();


//
builder.Services.AddHttpClient();
builder.Services.AddScoped<IImageAnalysisProvider, GeminiImageAnalysisProvider>();






// =======================
// JWT Authentication
// =======================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"] 
                    ?? throw new Exception("JWT Key not configured")
                )
            )
        };
    });

builder.Services.AddAuthorization();

// =======================
// Swagger + JWT Support
// =======================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter 'Bearer {your JWT token}'"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});



var app = builder.Build();



// =======================
// Middleware Pipeline
// =======================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
