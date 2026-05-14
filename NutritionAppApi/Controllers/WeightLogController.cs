using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionAppApi.DTOs;
using NutritionAppApi.Interfaces;

namespace NutritionAppApi.Controllers
{   
    [Route("api/progress")]
    [ApiController]
    [Authorize]
    public class WeightLogController : ControllerBase
    {
        private readonly IWeightLogService _service;
        
        public WeightLogController(IWeightLogService service)
        {
            _service = service;
        }

        // GET: /api/progress/summary
        [HttpGet("summary")]
        public async Task<ActionResult<ProgressSummaryDto>> GetProgress()
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.GetProgressSummaryAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: /api/progress/weight
        [HttpPost("weight")]
        public async Task<ActionResult<WeightLogResponseDto>> LogWeight(WeightLogRequestDto request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.LogWeightAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: /api/progress/weight
        [HttpGet("weight")]
        public async Task<ActionResult<List<WeightLogResponseDto>>> GetWeightHistory(
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.GetWeightHistoryAsync(userId, startDate, endDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Optional: DELETE /api/progress/weight/{id}
        [HttpDelete("weight/{id}")]
        public async Task<IActionResult> DeleteWeightLog(int id)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                await _service.DeleteWeightLogAsync(userId, id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}