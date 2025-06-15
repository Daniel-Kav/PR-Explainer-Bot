# PR Explainer Bot

A NestJS backend service that analyzes GitHub pull requests and provides a summary and risk assessment using Google's Gemini model.

## Features

- Fetches PR diffs from GitHub
- Generates concise summaries of changes using Google's Gemini model
- Provides a risk score from 1 (low) to 5 (high)
- RESTful API endpoint for easy integration

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- GitHub account with a personal access token
- Google Gemini API key

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pr-explainer-bot.git
   cd pr-explainer-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your GitHub token and Gemini API key:
   ```
   GITHUB_TOKEN=your_github_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   pnpm start:dev
   ```

   The API will be available at `http://localhost:3000`

## API Endpoint

### Generate PR Summary

```http
POST /pr-summary
Content-Type: application/json

{
  "repo": "owner/repo",
  "pr_number": 123
}
```

#### Response

```json
{
  "summary": "This PR refactors the authentication module to use JWT tokens...",
  "risk_score": 3
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub personal access token with `repo` scope | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `PORT` | Port to run the server on (default: 3000) | No |
| `NODE_ENV` | Node environment (development/production) | No |

## Example cURL

```bash
curl -X POST http://localhost:3000/pr-summary \
  -H "Content-Type: application/json" \
  -d '{"repo":"facebook/react","pr_number":12345}'
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input data
- `404 Not Found`: PR not found
- `401 Unauthorized`: Missing or invalid GitHub token
- `500 Internal Server Error`: Server error (check logs for details)

## Development

- Run in development mode: `pnpm start:dev`
- Build for production: `pnpm build`
- Run tests: `pnpm test`
- Format code: `pnpm format`
- Lint code: `pnpm lint`

## License

MIT
