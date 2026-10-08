import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'nexus-backend', ts: new Date().toISOString() });
});

const port = Number(process.env.BACKEND_PORT ?? 4000);
app.listen(port, () => {
  console.log(`[nexus-backend] listening on http://localhost:${port}`);
});
