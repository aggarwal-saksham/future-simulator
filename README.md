# Future Simulator

## Overview

Future Simulator is a React-based forecasting dashboard for exploring short-term business scenarios. It helps a user upload operating data, adjust a set of business assumptions, and generate a six-week forecast with confidence ranges, anomaly detection, and a concise AI-assisted summary. The project is aimed at hackathon judges, product reviewers, and SME-focused banking or finance teams who need a fast way to understand how operational changes and external signals could affect near-term performance.

The project solves a common decision-making problem: many small businesses and finance teams have historical data, but they do not have a simple interface for testing "what happens next" under changing growth, cost, staffing, FX, or supply conditions. This application turns that data into an interactive scenario model and presents the output in a readable dashboard instead of requiring spreadsheet-heavy manual analysis.

## Features

The following features are implemented and present in the codebase:

- Upload CSV data or paste tabular data directly into the dashboard.
- Parse uploaded data into a normalized time-series format.
- Run a six-week simulation using configurable business assumptions.
- Adjust scenario controls such as growth, expense shock, hiring plan, marketing lift, price change, FX sensitivity, supplier risk, and inventory coverage.
- Detect anomalies in historical input data.
- Display forecast results with low, central, and high projection bands.
- Compare the active scenario against a baseline scenario.
- Generate dashboard metrics such as trend, confidence, cash-gap risk, and health score.
- Show live news signals when a supported news API token is configured.
- Fall back to curated demo news signals if the live news request fails.
- Generate an AI-assisted summary using Gemini when quota and API access are available.
- Fall back to a local summary when Gemini is unavailable or rate-limited.
- Export results through the built-in export panel.

## Install And Run Instructions

### Prerequisites

- Node.js 18+ recommended
- npm

### 1. Clone the repository

```bash
git clone https://github.com/aggarwal-saksham/future-simulator.git
cd future-simulator
```

### 2. Install dependencies

If PowerShell blocks `npm.ps1`, use `cmd /c`:

```powershell
cmd /c npm install
```

### 3. Create your environment file

Copy the example file:

```powershell
Copy-Item .env.example .env
```

Then update `.env` with your own keys:

```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_THENEWSAPI_TOKEN=your_thenewsapi_token
```

### 4. Start the development server

```powershell
cmd /c npm run dev
```

Vite will print a local URL, typically:

```text
http://localhost:8080
```

### 5. Optional production preview

Build the app:

```powershell
cmd /c npm run build
```

Preview the production build:

```powershell
cmd /c npm run preview
```

## Tech Stack

### Languages

- TypeScript
- CSS
- HTML

### Frontend Framework And Tooling

- React 18
- Vite
- React Router
- React Query
- Vitest

### UI And Visualization

- Tailwind CSS
- shadcn/ui
- Radix UI
- Framer Motion
- Recharts
- Lucide React

### Data And Utilities

- Papa Parse for CSV parsing
- html2canvas for snapshot export
- jsPDF for PDF export

### External APIs / AI Services

- Google Gemini API for optional AI-generated summaries
- The News API for optional live business/news signals

## Usage Examples

### Example 1: Run the dashboard with sample data

1. Start the app.
2. Open the dashboard in the browser.
3. Leave the sample dataset loaded.
4. Adjust values in the scenario panel.
5. Click `Generate forecast`.

Expected output:

- A forecast chart with projection bands
- A compact AI/local summary card
- Scenario comparison and supporting insight panels

### Example 2: Upload your own CSV

Example input:

```csv
week,revenue
1,12000
2,12800
3,12300
4,13150
5,14020
6,13890
7,14450
8,14900
```

How to use it:

1. Go to the upload section.
2. Upload the CSV file or paste the rows manually.
3. Run the simulation.

Expected result:

- The app infers the label and numeric value columns
- Historical data is charted
- A new forecast is generated from your uploaded values

### Example 3: Enable live AI and live news

Set these values in `.env`:

```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_THENEWSAPI_TOKEN=your_thenewsapi_token
```

Behavior:

- If Gemini is available and within quota, the summary card uses Gemini output
- If Gemini is unavailable or rate-limited, the app falls back to the local summary
- If The News API responds successfully, live news signals are shown
- If the news request fails, curated fallback signals are shown instead

## Project Structure

```text
future-simulator/
  public/
  src/
    app/
    components/
      ui/
    features/
      dashboard/
        components/
        pages/
        config.tsx
    hooks/
    lib/
    pages/
    services/
    test/
  .env.example
  index.html
  package.json
  package-lock.json
  README.md
  tailwind.config.ts
  vite.config.ts
  vitest.config.ts
```

### Folder Notes

- `src/app` contains the application shell and route wiring.
- `src/features/dashboard` contains the main forecasting feature, page layout, and domain-specific UI components.
- `src/components/ui` contains shared UI primitives from shadcn/ui.
- `src/lib` contains simulation logic, sample data, and utilities.
- `src/services` contains external API integrations.
- `src/test` contains the current test setup.

## Architecture Notes

This project is currently a frontend-only application.

High-level structure:

```text
User Browser
  -> React/Vite frontend
  -> local simulation engine in src/lib/forecasting.ts
  -> optional Gemini API call for summary generation
  -> optional live news API call for external signals
```

### Data Flow

1. The user uploads or pastes time-series business data.
2. The app parses and validates the dataset.
3. The forecasting engine generates:
   - baseline metrics
   - scenario forecast bands
   - anomaly detection
   - derived risk and health metrics
4. Optional external integrations enrich the result:
   - Gemini for summary text
   - live news provider for signal weighting
5. The dashboard renders the output and allows export actions.

### Why This Structure Was Used

- Keeping the simulation engine in `src/lib` makes the business logic reusable and separate from UI rendering.
- Grouping dashboard-specific files under `src/features/dashboard` reduces clutter and makes the main feature easier to navigate.
- Wrapping API integrations in `src/services` keeps provider-specific request logic out of components.

## Configuration

### Environment Variables

The project expects the following values in `.env`:

```env
VITE_GEMINI_API_KEY=
VITE_THENEWSAPI_TOKEN=
```

### Important Security Note

This project currently uses `VITE_...` environment variables, which means the values are exposed to the frontend bundle at runtime. This is acceptable for a hackathon prototype or demo, but not ideal for production-grade secret handling. A production version should move external API calls behind a backend or serverless proxy.

## Tests

Vitest is configured in the project, and the repository contains a test setup directory:

- `src/test/setup.ts`
- `src/test/example.test.ts`

Current status:

- test tooling is present
- test coverage is minimal
- the current repository should not claim broad or comprehensive automated test coverage

To run tests:

```powershell
cmd /c npm run test
```

## Limitations

This section is intentionally honest about the current state of the project.

- The app is frontend-only and does not yet use a backend for secrets or API proxying.
- External API keys are exposed to the client because they are injected through `VITE_...` variables.
- Gemini can return rate-limit errors such as `429`, in which case the app falls back to a local summary.
- Live news depends on third-party API reliability and token validity.
- The simulation logic is heuristic and prototype-oriented, not a validated financial forecasting model.
- Existing tests are limited and do not yet provide strong coverage of the forecasting engine or UI behavior.
- Some UI sections still reflect hackathon/demo framing rather than a fully production-polished workflow.

## Future Improvements

If more time were available, the next improvements would be:

- Move Gemini and news integrations behind a backend or serverless API route.
- Add stronger automated tests for forecast generation, parsing, and key UI flows.
- Improve live-news relevance with stronger filtering, deduplication, and source quality scoring.
- Add persistent saved scenarios and downloadable report history.
- Replace console-based debug logging with cleaner production-safe observability.
- Further simplify the dashboard by collapsing secondary insight panels behind progressive disclosure.

## Advanced / Technical Depth

The project combines deterministic scenario simulation with optional AI-assisted summarization.

- The forecasting layer uses time-series heuristics, moving averages, anomaly detection, volatility estimation, and scenario-based adjustments to generate a low/central/high projection range.
- Gemini is used only as an explanation layer, not as the core forecasting engine. This keeps the business logic deterministic and inspectable while still providing a faster user-facing interpretation of the results.
- External news signals are transformed into categorized business pressure signals such as demand, supply, FX, and cost. Those signals then influence the scenario model rather than being displayed as raw headlines alone.

This approach was chosen because it balances transparency and demo usefulness:

- deterministic logic keeps the output explainable
- AI adds readable summaries
- external signals make the simulation feel closer to real decision conditions

## Submission Notes

The repository includes:

- full frontend source code
- dependency configuration through `package.json` and `package-lock.json`
- environment-variable examples in `.env.example`
- a structured source layout

Before final submission, it is recommended to:

- verify the app from a clean clone
- run `npm install`
- run `npm run dev`
- confirm required environment variables are set
- remove any remaining debug-only console logging if submission rules require a cleaner production codebase
