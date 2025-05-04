import { MODEL_API_URL } from '../utils/config.ts';

export async function embed(text: string): Promise<number[]> {
  try {
    const res = await fetch(`${MODEL_API_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error(`Embed API error: ${res.status}`);
    const { embedding } = await res.json();
    return embedding;
  } catch (err) {
    console.error('embed error:', err);
    return [];  // 失敗時は空配列
  }
}
