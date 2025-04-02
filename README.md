# InjuryMVP - AI-Powered Sports Injury Tracking

A web application that helps athletes track sports injuries and get personalized recovery plans using AI.

## Features

- AI-powered injury analysis
- Personalized recovery plans
- Daily pain and mobility tracking
- Progress visualization
- Smart alerts for recovery monitoring

## Tech Stack

- React + TypeScript
- Vite
- Chakra UI
- Firebase (Authentication & Firestore)
- OpenAI GPT-4 API
- React Query
- React Router

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── services/      # API and external service integrations
  ├── hooks/         # Custom React hooks
  ├── utils/         # Utility functions
  ├── types/         # TypeScript type definitions
  └── config/        # Configuration files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT
