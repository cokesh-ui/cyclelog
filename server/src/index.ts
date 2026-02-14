import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { cyclesRouter } from './routes/cycles.js';
import { injectionsRouter } from './routes/injections.js';
import { subrecordsRouter } from './routes/subrecords.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 개발환경에서만 CORS 허용
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: true, credentials: true }));
}

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/cycles', cyclesRouter);
app.use('/api/cycles', injectionsRouter);
app.use('/api/cycles', subrecordsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// 프론트엔드 정적 파일 서빙 (프로덕션)
const clientDistPath = path.join(__dirname, '../client');
app.use(express.static(clientDistPath));

// SPA fallback: API가 아닌 모든 요청을 index.html로
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
