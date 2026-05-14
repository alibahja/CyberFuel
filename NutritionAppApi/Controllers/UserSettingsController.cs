using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionAppApi.DTOs;
using NutritionAppApi.Interfaces;

namespace NutritionAppApi.Controllers
{
    [Route("api/settings")]
    [ApiController]
    [Authorize]
    public class UserSettingsController : ControllerBase
    {
        private readonly IUserSettingsService _service;

        public UserSettingsController(IUserSettingsService service)
        {
            _service = service;
        }

        // GET: /api/settings
        [HttpGet]
        public async Task<ActionResult<SettingsResponseDto>> GetSettings()
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.GetSettingsAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: /api/settings
        [HttpPut]
        public async Task<ActionResult<SettingsResponseDto>> UpdateSettings(SettingsRequestDto request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.UpdateSettingsAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}