# CyberFuel - AI-Powered Nutrition Tracking App
https://img.shields.io/badge/platform-iOS%2520%257C%2520Android-blue
https://img.shields.io/badge/React%2520Native-0.74-61DAFB
https://img.shields.io/badge/ASP.NET%2520Core-8.0-512BD4
https://img.shields.io/badge/MySQL-8.0-4479A1

Track meals, scan & estimate macros with Gemini AI, and get personalized meal plans based on your body data and preferences (vegan, low budget, etc.).

# About The Project
CyberFuel is a cross-platform mobile application that revolutionizes dietary tracking by embedding artificial intelligence at the core of the meal-logging workflow.

Key Metrics Achieved:
Metric	Target	Achieved
AI Meal Logging Speed	< 15 sec	8 sec
API Response Time	< 2 sec	0.85 sec
Concurrent Users	100	150+
Test Pass Rate	≥ 95%	96.9%
User Satisfaction	4.0/5.0	4.7/5.0

# Features
 AI Meal Scanning - Photograph any meal and get instant calorie & macro estimates (8 seconds avg)

 Real-time Dashboard - Track daily calories, protein, carbs, and fats with visual progress rings

 AI Meal Plan Generator - Personalized daily meal plans based on biometrics, dietary restrictions, cuisine preferences, and budget

 Weight & Progress Tracking - Interactive charts to visualize your journey

 Secure Authentication - JWT-based auth with bcrypt password hashing

 Dark/Light Theme - Persistent theme preference across sessions

#Tech Stack
Frontend (React Native Expo)
text
- React Native 0.74 (Expo SDK 51)
- Expo Router v3 (File-based navigation)
- React Context API (State management)
- Axios (HTTP client)
- Expo SecureStore (JWT storage)
- react-native-svg (Charts)
Backend (ASP.NET Core)
text
- ASP.NET Core 8.0 LTS
- Entity Framework Core 8.0
- MySQL 8.0
- JWT Authentication
- BCrypt Password Hashing
AI Integrations
Gemini AI - Meal image recognition & nutritional analysis

LLM API - Personalized meal plan generation

📂 Project Structure
```
CyberFuel/
├── MyMobileApp/                 # React Native Frontend
│   ├── app/                     # Expo Router screens
│   ├── components/              # Reusable UI components
│   ├── contexts/                # Auth & Theme contexts
│   ├── services/                # API service layer
│   ├── config/                  # App configuration
│   └── package.json
│
├── NutritionAppApi/             # ASP.NET Core Backend
│   ├── Controllers/             # API endpoints
│   ├── Services/                # Business logic
│   ├── Data/                    # DbContext
│   ├── Models/                  # Entity models
│   ├── DTOs/                    # Data transfer objects
│   ├── Migrations/              # EF Core migrations
│   └── Program.cs
│
└── README.md
```
# Getting Started
Prerequisites
Node.js (v18+)

.NET 8.0 SDK

MySQL 8.0

Expo Go app (iOS/Android)

Git

Backend Setup
bash
# Clone the repository
git clone https://github.com/alibahja/CyberFuel.git
cd CyberFuel/NutritionAppApi

# Restore dependencies
dotnet restore

# Update appsettings.json with your MySQL connection string
# "ConnectionStrings": {
#   "DefaultConnection": "Server=localhost;Database=CyberFuelDb;User=root;Password=yourpassword;"
# }

# Run migrations
dotnet ef database update

# Start the API
dotnet run
The API will run at http://localhost:5039

Frontend Setup
bash
# Navigate to frontend directory
cd ../MyMobileApp

# Install dependencies
npm install

# Update API base URL in config/app.ts
# Change to your backend IP/port

# Start Expo
npx expo start
Scan the QR code with Expo Go on your device.

# API Endpoints (Key Examples)
Method	Endpoint	Description
POST	/api/auth/register	Create new account
POST	/api/auth/login	Authenticate & receive JWT
GET	/api/profile	Get user profile
POST	/api/meals/log	Log manual meal
POST	/api/photo/analyze	AI photo analysis
POST	/api/mealplan/generate	Generate AI meal plan
GET	/api/progress/weight	Get weight history
Full API documentation available in the report (Appendix A)

# Test Results
Test Category	Executed	Passed	Pass Rate
Unit Tests	45	44	97.8%
Integration Tests	28	27	96.4%
System Tests	32	31	96.9%
User Acceptance	15	14	93.3%
TOTAL	120	116	96.7%

# User Satisfaction (UAT, n=5)
Feature	Rating (1-5)
AI Photo Scanning	4.8 ⭐
Daily Dashboard	4.7 ⭐
Progress Charts	4.6 ⭐
Meal Plan Generation	4.4 ⭐
Overall	4.7 ⭐

# Future Enhancements
Barcode scanning for packaged foods

Offline mode with local SQLite caching

Push notifications for meal reminders

Food database search

Adaptive meal plans based on weekly trends

Wearable device integration (Apple Health / Google Fit)

Data export (PDF/CSV)

# License
This project is for academic purposes as part of a capstone requirement.
