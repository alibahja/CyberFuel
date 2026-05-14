using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NutritionAppApi.DTOs;
using NutritionAppApi.Services;
using System.IO;

namespace NutritionAppApi.Controllers
{
    [ApiController]
    [Route("api/photo")]
    [Authorize]
    public class PhotoAnalysisController : ControllerBase
    {
        private readonly IPhotoAnalysisService _photoService;
          private readonly IConfiguration _configuration;

        public PhotoAnalysisController(IPhotoAnalysisService photoService, IConfiguration configuration)
        {
            _photoService = photoService;
            _configuration = configuration;
        }

        // POST: api/photo/analyze
        // Upload image and analyze calories
        [HttpPost("analyze")]
        public async Task<ActionResult<PhotoAnalyzeResponseDto>> AnalyzeImage([FromForm] IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
                return BadRequest("Image file is required.");

            try
            {
                int userId = int.Parse(
                    User.FindFirst(ClaimTypes.NameIdentifier)!.Value
                );

                var result = await _photoService.AnalyzeImageAsync(userId, imageFile);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST: api/photo/confirm
        // Confirm or adjust AI result and optionally save as meal
        [HttpPost("confirm")]
        public async Task<ActionResult<PhotoAnalyzeResponseDto>> ConfirmAnalysis(
            [FromBody] ConfirmPhotoRequestDto request)
        {
            try
            {
                int userId = int.Parse(
                    User.FindFirst(ClaimTypes.NameIdentifier)!.Value
                );

                var result = await _photoService.ConfirmAnalysisAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/photo/{id}
        // Get analysis by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<PhotoAnalyzeResponseDto>> GetAnalysis(int id)
        {
            try
            {
                int userId = int.Parse(
                    User.FindFirst(ClaimTypes.NameIdentifier)!.Value
                );

                var result = await _photoService.GetAnalysisAsync(userId, id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        [HttpPost("debug-raw")]
[AllowAnonymous]
public async Task<IActionResult> DebugRawRequest([FromForm] IFormFile imageFile)
{
    if (imageFile == null || imageFile.Length == 0)
        return BadRequest("Image file is required.");

    try
    {
        // Save temp file
        var tempPath = Path.GetTempPath();
        var fileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
        var filePath = Path.Combine(tempPath, fileName);
        
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await imageFile.CopyToAsync(stream);
        }

        // Read and encode image
        var imageBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        var base64Image = Convert.ToBase64String(imageBytes);
        
        // EXACT request payload you're sending
        var requestPayload = new
        {
            contents = new[]
            {
                new
                {
                    parts = new object[]
                    {
                        new 
                        { 
                            text = @"Analyze this food image. Return a valid JSON object with this exact structure:
                            {
                                ""foods"": [""item1"", ""item2""],
                                ""estimatedCalories"": number,
                                ""estimatedProteinGrams"": number,
                                ""estimatedCarbsGrams"": number,
                                ""estimatedFatsGrams"": number
                            }
                            Only return the JSON object, nothing else."
                        },
                        new
                        {
                            inline_data = new
                            {
                                mime_type = "image/png",
                                data = base64Image
                            }
                        }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.1,
                maxOutputTokens = 200
            }
        };

        // Convert to JSON to see what's being sent
        var jsonPayload = System.Text.Json.JsonSerializer.Serialize(requestPayload, 
            new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
        
        Console.WriteLine("=== RAW REQUEST PAYLOAD ===");
        Console.WriteLine(jsonPayload);
        Console.WriteLine("=== END PAYLOAD ===");
        
        // Also try a direct curl-style request
        var apiKey = _configuration["Gemini:ApiKey"];
        var httpClient = new HttpClient();
        
        var response = await httpClient.PostAsJsonAsync(
            $"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key={apiKey}",
            requestPayload
        );
        
        var responseText = await response.Content.ReadAsStringAsync();
        
        // Clean up
        if (System.IO.File.Exists(filePath))
            System.IO.File.Delete(filePath);
            
        return Ok(new {
            RequestPayload = jsonPayload,
            ResponseStatusCode = (int)response.StatusCode,
            ResponseBody = responseText,
            RequestUrl = $"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=REDACTED"
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new {
            Error = ex.Message,
            StackTrace = ex.StackTrace
        });
    }
}
    }
}
