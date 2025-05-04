import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import { USERNAME, PASSWORD, JWT_SECRET } from '../utils/config.ts';

const app = new Hono();

app.post('/login', async c => {
  const { username, password } = await c.req.json();
  if (username===USERNAME && password===PASSWORD) {
    const token = jwt.sign({ sub:username }, JWT_SECRET, { expiresIn:'24h' });
    return c.json({ token });
  }
  return c.json({ error:'Unauthorized' }, 401);
});

export default app;
