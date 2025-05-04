import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/auth.ts';
import { validateQuery } from '../validators/query.ts';
import { search as vectorSearch } from '../llm/search.ts';
import { webSearch } from '../utils/websearch.ts';

const app = new Hono();
app.use('*', authMiddleware);

app.get('/', async c => {
  const q = c.req.query('q') || '';
  if (!validateQuery(q)) return c.json({ error: 'Invalid query' }, 400);

  console.log('Search query:', q);
  const [vecResults, webResults] = await Promise.all([
    vectorSearch(q, 5),
    webSearch(q, 5)
  ]);
  console.log('Vector Search Results:', vecResults);
  console.log('Web Search Results:', webResults);

  const results = vecResults.length > 0 ? vecResults : webResults;
  return c.json({ results });
});

export default app;
