import { MODEL_API_URL } from '../utils/config.ts';

export async function generate(contexts: string[], question: string): Promise<string> {
  const prompt = `${contexts.join('\n')}\n質問: ${question}\n→回答:`;
  try {
    const res = await fetch(`${MODEL_API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      console.error('Generate API error:', res.status, await res.text());
      return '';
    }
    const text = await res.text();               // JSON ではなく生テキスト取得
    try {
      const data = JSON.parse(text);             // 明示的に parse
      return typeof data.answer === 'string' ? data.answer : '';
    } catch {
      console.error('Invalid JSON from generate API:', text);
      return '';
    }
  } catch (err) {
    console.error('Generate fetch error:', err);
    return '';
  }
}
