# Sun Devil Support Hub

AI-powered chat assistant for ASU Online learners.  
This app provides support for policies, courses, and student success resources using Gemini.

## Tech Stack

- React + TypeScript
- Vite
- Gemini API (`@google/genai`)

## Prerequisites

- Node.js 18+
- npm
- Gemini API key

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a local env file and set your API key:
   ```bash
   cp .env.example .env.local
   ```
   Then update `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

## Available Scripts

- `npm run dev` – Start local dev server on port 3000
- `npm run build` – Build production assets
- `npm run preview` – Preview production build
- `npm run lint` – Type-check project
- `npm run clean` – Remove `dist` directory
