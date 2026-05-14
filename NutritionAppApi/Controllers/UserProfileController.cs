using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionAppApi.DTOs;
using NutritionAppApi.Services;
using System.Security.Claims;

namespace NutritionAppApi.Controllers
{
    [Route("api/profile")]
    [ApiController]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _service;

        public UserProfileController(IUserProfileService service)
        {
            _service = service;
        }

        // GET: api/profile
        [HttpGet]
        public async Task<ActionResult<ProfileResponseDto>> GetProfile()
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.GetProfileAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        // POST: api/profile
        [HttpPost]
        public async Task<ActionResult<ProfileResponseDto>> Create(ProfileRequestDto request)
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

        // PUT: api/profile
        [HttpPut]
        public async Task<ActionResult<ProfileResponseDto>> Update(ProfileRequestDto request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
                var result = await _service.UpdateAsync(request, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

