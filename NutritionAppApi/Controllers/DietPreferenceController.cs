using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionAppApi.DTOs;
using NutritionAppApi.Services;

namespace NutritionAppApi.Controllers
{   [Route("api/preferences")]
    [ApiController]
    [Authorize]
    public class DietPreferenceController : ControllerBase
    {
        private readonly IDietPreferenceService _service;

        public DietPreferenceController(IDietPreferenceService service)
        {
            _service = service;
        }

        //Get: /api/preferences
        [HttpGet]
        public async Task<ActionResult<PreferenceResponseDto>> GetPreference()
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.GetDietPref(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        //Post: /api/preferences
        [HttpPost]
        public async Task<ActionResult<PreferenceResponseDto>> Create(PreferenceRequestDto request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.CreateAsync(request, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        //Post: /api/preferences
        [HttpPut]
        public async Task<ActionResult<PreferenceResponseDto>> Update(PreferenceRequestDto request)
        {
             try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.UpdateAsync(request,userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
    }
}