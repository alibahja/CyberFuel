using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionAppApi.DTOs;
using NutritionAppApi.Interfaces;

namespace NutritionAppApi.Controllers
{
    [Route("api/meallog")]
    [ApiController]
    [Authorize]
    public class MealLogController : ControllerBase
    {
        private readonly IMealLogService _service;
        public MealLogController(IMealLogService service)
        {
            _service = service;
        }

        // POST: /api/meallog
        [HttpPost]
        public async Task<ActionResult<MealLogResponseDto>> LogMeal(MealLogRequestDto request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.LogMealAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: /api/meallog/daily/{date}
        [HttpGet("daily/{date}")]
        public async Task<ActionResult<List<MealLogResponseDto>>> GetDailyLogs(DateTime date)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.GetDailyLogsAsync(userId, date);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        // PUT: /api/meallog/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<MealLogResponseDto>> UpdateMealLog(int id, MealLogRequestDto request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.UpdateMealLogAsync(userId, id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // DELETE: /api/meallog/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMealLog(int id)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                await _service.DeleteMealLogAsync(userId, id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}