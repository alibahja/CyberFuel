# Nutrition App - React Native Frontend

A complete React Native frontend application that connects to the ASP.NET backend API for nutrition tracking, meal planning, and progress monitoring.

## Features

- **Authentication**: Login and registration with JWT token management
- **User Profile**: Create and update user profile with health metrics
- **Meal Logging**: Log meals manually with calories and macronutrients
- **Meal Plans**: Generate and view personalized meal plans
- **Photo Analysis**: Analyze food photos using AI to extract nutritional information
- **Diet Preferences**: Set dietary restrictions, allergies, and budget preferences
- **Progress Tracking**: Log weight and track progress over time
- **Settings**: Configure app preferences including units and notifications

## Setup

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI
- Backend API running (ASP.NET)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API endpoint:
   - Open `config/api.ts`
   - Update `API_BASE_URL` with your backend URL
   - For physical devices, use your computer's IP address instead of `localhost`
   - For Android emulator, use `http://10.0.2.2:5000`
   - For iOS simulator, `localhost` should work

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For web
```

## Project Structure

```
MyMobileApp/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── meals/             # Meal logging screens
│   ├── mealplan/          # Meal plan screens
│   ├── photo/             # Photo analysis screens
│   ├── profile/           # User profile screens
│   ├── preferences/       # Diet preferences screens
│   ├── settings/          # App settings screens
│   └── progress/          # Progress tracking screens
├── components/            # Reusable components
├── config/                # Configuration files
├── contexts/              # React contexts (Auth)
├── services/              # API service layer
└── types/                 # TypeScript type definitions
```

## API Integration

All API calls are handled through the `apiService` in `services/api.ts`. The service includes:
- Automatic JWT token injection
- Error handling and token refresh
- Type-safe request/response handling

## Authentication Flow

1. User registers/logs in
2. JWT token is stored securely using `expo-secure-store`
3. Token is automatically included in all API requests
4. Protected routes check authentication status
5. Unauthenticated users are redirected to login

## Key Screens

- **Home**: Dashboard with quick actions and daily summary
- **Meals**: View and log daily meals
- **Meal Plan**: Generate and view personalized meal plans
- **Photo Analysis**: Analyze food photos with AI
- **Progress**: Track weight and view progress charts
- **Profile**: Manage user profile and health metrics
- **Preferences**: Set dietary preferences
- **Settings**: Configure app settings

## Dependencies

- `expo-router`: File-based routing
- `axios`: HTTP client for API calls
- `expo-secure-store`: Secure token storage
- `expo-image-picker`: Image selection for photo analysis
- `@react-navigation`: Navigation library

## Backend API Endpoints

The app connects to the following backend endpoints:
- `/api/auth/*` - Authentication
- `/api/profile` - User profile
- `/api/meallog/*` - Meal logging
- `/api/mealplan/*` - Meal plans
- `/api/photo/*` - Photo analysis
- `/api/preferences` - Diet preferences
- `/api/settings` - User settings
- `/api/progress/*` - Progress tracking

## Notes

- Make sure your backend CORS settings allow requests from your mobile app
- For development, you may need to configure your backend to accept requests from your device's IP address
- The app uses secure storage for authentication tokens
- All API calls include proper error handling and user feedback
