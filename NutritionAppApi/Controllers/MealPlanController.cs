using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionAppApi.DTOs;
using NutritionAppApi.Services;

namespace NutritionAppApi.Controllers
{
    [Route("api/mealplan")]
    [ApiController]
    [Authorize]
    public class MealPlanController : ControllerBase
    {
        private readonly IMealPlanService _service;

        public MealPlanController(IMealPlanService service)
        {
            _service = service;
        }

        // POST: /api/mealplan/generate
        [HttpPost("generate")]
        public async Task<ActionResult<MealPlanResponseDto>> Create()
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
                return Unauthorized("Invalid user token");

            var result = await _service.CreateMealPlanAsync(userId);
            return CreatedAtAction(nameof(GetPlan), new { } ,result);
        }

        // PUT: /api/mealplan/regenerate
        [HttpPut("regenerate")]
        public async Task<ActionResult<MealPlanResponseDto>> Regenerate()
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
                return Unauthorized("Invalid user token");

            var result = await _service.RegenerateMealPlanAsync(userId);
            return Ok(result);
        }

        // GET: /api/mealplan
        [HttpGet]
        public async Task<ActionResult<MealPlanResponseDto>> GetPlan()
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
                return Unauthorized("Invalid user token");

            var result = await _service.GetMealPlanAsync(userId);
            return Ok(result);
        }
    }
}
