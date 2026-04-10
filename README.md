# Future Simulator

Future Simulator is a Vite + React + TypeScript dashboard for running business forecasting scenarios, comparing baseline vs. adjusted outcomes, and generating AI-assisted summary insights.

## Project Structure

- `src/app` application shell and routing
- `src/features/dashboard` dashboard page, feature components, and feature config
- `src/components/ui` shared shadcn/ui primitives
- `src/lib` simulation logic, sample data, and utility helpers
- `src/services` external API integrations
- `src/test` Vitest setup and tests

## Local Setup

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env`
3. Add your Gemini API key to `VITE_GEMINI_API_KEY`
4. Run `npm run dev`

## Gemini API Key

For the free tier, create a key in Google AI Studio:

1. Open [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Add it to `.env` as `VITE_GEMINI_API_KEY=your_key_here`

If the key is missing, the dashboard automatically falls back to the local summary generator.
