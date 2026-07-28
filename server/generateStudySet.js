import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const SYSTEM_PROMPT = `You are a study assistant. Given notes or a topic, return ONLY valid JSON (no markdown fences) with this exact shape:

{
  "title": "string - short title for the study set",
  "flashcards": [
    { "id": "fc-1", "front": "question or term", "back": "answer or definition" }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "multiple choice question",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0
    }
  ]
}

Rules:
- Generate 5-8 flashcards and 4-6 quiz questions.
- Each flashcard and quiz item must have a unique id (fc-1, fc-2, q-1, q-2, etc.).
- correctIndex is 0-based index into options array.
- Every quiz must have exactly 4 options.
- Return ONLY the JSON object, nothing else.`;

function extractJson(text) {
  const trimmed = text.trim();
  // Strip markdown code fences if model adds them anyway
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
  return JSON.parse(candidate);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function validateStudySet(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response is not an object'] };
  }

  if (!isNonEmptyString(data.title)) {
    errors.push('Missing or empty title');
  }

  if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
    errors.push('flashcards must be a non-empty array');
  } else {
    data.flashcards.forEach((card, i) => {
      if (!isNonEmptyString(card?.id)) errors.push(`flashcards[${i}].id is required`);
      if (!isNonEmptyString(card?.front)) errors.push(`flashcards[${i}].front is required`);
      if (!isNonEmptyString(card?.back)) errors.push(`flashcards[${i}].back is required`);
    });
  }

  if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
    errors.push('quiz must be a non-empty array');
  } else {
    data.quiz.forEach((q, i) => {
      if (!isNonEmptyString(q?.id)) errors.push(`quiz[${i}].id is required`);
      if (!isNonEmptyString(q?.question)) errors.push(`quiz[${i}].question is required`);
      if (!Array.isArray(q?.options) || q.options.length !== 4) {
        errors.push(`quiz[${i}].options must have exactly 4 items`);
      } else if (q.options.some((o) => !isNonEmptyString(o))) {
        errors.push(`quiz[${i}].options must be non-empty strings`);
      }
      if (typeof q?.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
        errors.push(`quiz[${i}].correctIndex must be 0-3`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

export async function generateStudySet(notes) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('Server missing GROQ_API_KEY. Copy .env.example to .env and add your key.'), {
      code: 'CONFIG',
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: notes },
        ],
        temperature: 0.4,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw Object.assign(
        new Error(`AI provider returned ${response.status}: ${errBody.slice(0, 200)}`),
        { code: 'PROVIDER' }
      );
    }

    const payload = await response.json();
    const raw = payload?.choices?.[0]?.message?.content;

    if (!raw || !raw.trim()) {
      throw Object.assign(new Error('Model returned empty response'), { code: 'EMPTY' });
    }

    let parsed;
    try {
      parsed = extractJson(raw);
    } catch {
      throw Object.assign(new Error('Model returned invalid JSON'), { code: 'PARSE' });
    }

    const { valid, errors } = validateStudySet(parsed);
    if (!valid) {
      throw Object.assign(new Error(`Invalid structure: ${errors.join('; ')}`), {
        code: 'VALIDATION',
      });
    }

    return parsed;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('Request timed out. Try again with shorter notes.'), {
        code: 'TIMEOUT',
      });
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
