import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateStudySet } from './generateStudySet.js';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.post('/api/generate', async (req, res) => {
  const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim() : '';

  if (!notes) {
    return res.status(400).json({ error: 'Please enter some notes or a topic.', code: 'INPUT' });
  }

  if (notes.length > 8000) {
    return res.status(400).json({ error: 'Input is too long (max 8000 characters).', code: 'INPUT' });
  }

  try {
    const studySet = await generateStudySet(notes);
    res.json(studySet);
  } catch (err) {
    const code = err.code || 'UNKNOWN';
    const status =
      code === 'CONFIG' ? 503 :
      code === 'INPUT' ? 400 :
      code === 'PROVIDER' ? 502 :
      422;

    res.status(status).json({
      error: err.message || 'Something went wrong.',
      code,
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Serve React build in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
