/// <reference types="bun-types" />
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';

import auth from './routes/auth.ts';
import search from './routes/search.ts';
import ask from './routes/ask.ts';
import { initStore } from './llm/search.ts';
import { MODEL_API_URL } from './utils/config.ts';

const app = new Hono();
app.use('*', logger());

// API routes
app.route('/auth', auth);
app.route('/search', search);
app.route('/ask', ask);

// SPA のエントリ（index.html）を返す
app.get('/', serveStatic({ root: './public', path: 'index.html' }));
// その他の静的リソース
app.use('/*', serveStatic({ root: './public' }));

(async () => {
  try {
    console.log('Checking LLM model availability...');
    try {
      const res = await fetch(`${MODEL_API_URL}/health`);
      console.log('Model health:', await res.json());
    } catch (err) {
      console.error('Model health check failed:', err);
    }

    await initStore();
    Bun.serve({ fetch: app.fetch, port: 3000 });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    console.error('Initialization error:', err);
    process.exit(1);
  }
})();
