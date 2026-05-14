
using NutritionAppApi.DTOs;
using NutritionAppApi.Interfaces;
using System.Net.Http.Headers;
using System.Text.Json;

namespace NutritionAppApi.Services
{
    public class GeminiImageAnalysisProvider : IImageAnalysisProvider
    {
        private readonly string _apiKey;
        private readonly HttpClient _httpClient; // Keep for fallback if needed

        // You'll likely use the REST API initially; the gRPC client setup is more complex.
        // We'll use HttpClient for simplicity.
        public GeminiImageAnalysisProvider(
            IConfiguration configuration,
            HttpClient httpClient)
        {
            _apiKey = configuration["Gemini:ApiKey"] 
                ?? throw new Exception("Gemini API key not configured.");
            _httpClient = httpClient;
        }

        public async Task<ImageAnalysisResultDto> AnalyzeAsync(string imagePath)
        {
            try
            {
                Console.WriteLine($"Analyzing image with Gemini: {imagePath}");
                
                // Read and encode image
                var imageBytes = await File.ReadAllBytesAsync(imagePath);
                var base64Image = Convert.ToBase64String(imageBytes);
                
                // Construct the request payload for Gemini 1.5 Flash
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
        // NO systemInstruction, responseMimeType, or responseSchema
    }
};

                // Make the API request
               // Make the API request
var response = await _httpClient.PostAsJsonAsync(
    // Just change the model name in the URL:
   $"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key={_apiKey}",
    requestPayload
);

                var json = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Gemini raw response: {json}");

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Gemini API Error ({response.StatusCode}): {json}");
                }

                // Parse the response
                var (foods, calories, protein, carbs, fats) = ExtractNutritionFromGeminiResponse(json);

                return new ImageAnalysisResultDto
                {
                        DetectedFoods = foods,
                        EstimatedCalories = calories,
                        EstimatedProtein = protein,
                        EstimatedCarbs = carbs,
                        EstimatedFats = fats,
                        ConfidenceLevel = foods.Count > 0 ? "Medium" : "Low",
                        RawResponse = json,
                        ProviderName = "Google Gemini"
                 };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in Gemini AnalyzeAsync: {ex.Message}");
                throw;
            }
        }

       private (List<string> Foods, float Calories, float? Protein, float? Carbs, float? Fats) 
    ExtractNutritionFromGeminiResponse(string json)
{
    try
    {
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        
        // Get the text from Gemini
        var responseText = root
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString()?
            .Trim();

        if (string.IsNullOrEmpty(responseText))
            return (new List<string>(), 0, null, null, null);

        // === NEW CODE: Strip markdown code blocks ===
        if (responseText.StartsWith("```json"))
        {
            responseText = responseText.Replace("```json", "").Replace("```", "").Trim();
        }
        // ============================================

        // Parse the inner JSON object from the response text
        using var nutritionDoc = JsonDocument.Parse(responseText); // Now clean JSON
        var nutritionRoot = nutritionDoc.RootElement;

        var foods = nutritionRoot.GetProperty("foods")
            .EnumerateArray()
            .Select(f => f.GetString())
            .Where(f => f != null)
            .Select(f => f!)
            .ToList();

        var calories = nutritionRoot.GetProperty("estimatedCalories").GetSingle();
        var protein = nutritionRoot.TryGetProperty("estimatedProteinGrams", out var p) ? p.GetSingle() : (float?)null;
        var carbs = nutritionRoot.TryGetProperty("estimatedCarbsGrams", out var c) ? c.GetSingle() : (float?)null;
        var fats = nutritionRoot.TryGetProperty("estimatedFatsGrams", out var f) ? f.GetSingle() : (float?)null;

        Console.WriteLine($"Extracted: {foods.Count} foods, {calories} kcal, P:{protein}g, C:{carbs}g, F:{fats}g");
        return (foods, calories, protein, carbs, fats);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error parsing nutrition: {ex.Message}");
        Console.WriteLine($"Response was: {json}"); // Log the full response for debugging
        return (new List<string>(), 0, null, null, null);
    }
}

        private float EstimateCalories(List<string> foods)
        {
            // Your existing logic - adjust as needed
            if (foods.Count == 0) return 0f;
            return foods.Count * 200f;
        }
    }
}