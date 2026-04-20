## Sun Devil Support Hub

AI-powered academic assistant for ASU Online learners, providing instant support for policies, courses, and student success resources.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`

## AI Error Handling

The app now provides specific, user-friendly error feedback when AI response generation fails.

### Error categories surfaced to users

- **Missing API key**: indicates the Gemini service is not configured.
- **Authentication/permission errors (401/403)**: indicates temporary auth issues with the AI service.
- **Rate limit/quota errors (429)**: prompts users to retry after a short wait.
- **Bad request errors (400)**: asks users to rephrase and resend.
- **Network/timeout issues**: suggests checking connection and retrying.
- **Service unavailable errors (5xx)**: communicates temporary backend unavailability.
- **Fallback unknown errors**: shows a generic retry message.

### Where this is implemented

- `src/services/geminiService.ts`
  - `getUserFriendlyAiErrorMessage(error)` maps technical failures to clear user guidance.
- `src/App.tsx`
  - Chat send flows (`handleSend` and quick actions) now display the mapped message in chat.

## Troubleshooting

- Verify `.env.local` contains a valid `GEMINI_API_KEY`.
- If you hit rate limits, wait briefly and try again.
- If service errors persist, retry later or contact ASU support resources.