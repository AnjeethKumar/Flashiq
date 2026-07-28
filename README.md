# Study Assistant

A React app that turns free-form notes into interactive flashcards and quizzes using an LLM. Built for a frontend internship assignment — focused on structured AI output, failure handling, and interactive UI (not a chatbot).

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Add API key** — get a free key at [console.groq.com](https://console.groq.com)
   ```bash
   cp .env.example .env
   # Edit .env and set GROQ_API_KEY=your_key
   ```

3. **Run**
   ```bash
   npm start
   ```
   Opens at **http://localhost:3001** (Express serves the built React app + API).

   For development with hot reload:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173 (proxies `/api` to backend)
   - Backend: http://localhost:3001

## Usage

1. Paste lecture notes or type a topic (e.g. "React hooks: useState, useEffect…").
2. Click **Generate flashcards & quiz**.
3. **Flashcards** — tap to flip, use Previous/Next to navigate.
4. **Quiz** — answer multiple-choice questions; after finishing, use **Retest wrong** to retry missed questions.

## Architecture

```
User input → React UI → POST /api/generate → Groq (llama-3.3-70b)
                              ↓
                    JSON validation on server
                              ↓
              Structured { title, flashcards[], quiz[] }
                              ↓
         Interactive components (flip cards, quiz, retest)
```

- **API key stays on the server** — never exposed to the browser.
- **Structured output** — Groq `response_format: json_object` + server-side schema validation.
- **Stale response guard** — client uses request IDs + AbortController so older responses can't overwrite newer ones.
- **Error handling** — malformed JSON, wrong shape, empty response, timeout (45s), provider errors, and network failures all show a message + retry (no crashes).

## AI usage note

AI tools (Cursor) were used to scaffold the initial project structure, draft CSS layout, and speed up boilerplate. All architecture decisions, error-handling logic, validation schema, and component behavior were reviewed and understood — ready to explain or extend in an interview.

## Known limitations

- No streaming — full response waits until complete.
- No session save/reload.
- English-only prompts; very long inputs (>8000 chars) are rejected.
- Groq free tier rate limits may cause occasional 502 errors.
- Smaller/local models may return invalid JSON more often; retry usually helps.

## Time spent

~4 hours (MVP scope: core flow, error handling, mobile layout, README).

## Stack

- **Frontend:** React 19, Vite
- **Backend:** Express, Groq API
- **No TypeScript** (optional per assignment)
