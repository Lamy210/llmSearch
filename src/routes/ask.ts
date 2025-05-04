import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/auth.ts';
import { validateQuery } from '../validators/query.ts';
import { search } from '../llm/search.ts';
import { webSearch } from '../utils/websearch.ts';
import { generate } from '../llm/generate.ts';

const app = new Hono();
app.use('*', authMiddleware);

app.get('/', async c => {
  const q = c.req.query('q') || '';
  if (!validateQuery(q)) return c.json({ error: 'Invalid' }, 400);

  console.log('Ask query:', q);
  const [vecDocs, webDocs] = await Promise.all([
    search(q, 3),
    webSearch(q, 3)
  ]);
  console.log('Vector docs:', vecDocs);
  console.log('Web docs:', webDocs);

  const contexts = [
    ...vecDocs.map(d => d.text),
    ...webDocs.map(w => `${w.title}\n${w.url}`)
  ];
  console.log(`Calling generate() with ${contexts.length} contexts`);

  const ans = await generate(contexts, q);
  console.log('LLM answer:', ans);

  const docs = [...vecDocs, ...webDocs];
  return c.json({ answer: ans, docs });
});

export default app;
