import { embed } from './embed.ts';
import fs from 'fs';
import path from 'path';

type Doc = { id:string, text:string, vec:number[] };
const store: Doc[] = [];

export async function initStore() {
  const docsDir = path.resolve('docs');
  if (!fs.existsSync(docsDir)) {
    console.warn(`docs directory not found. Creating: ${docsDir}`);
    fs.mkdirSync(docsDir, { recursive: true });
    return;  // 空ディレクトリ作成後はストア初期化をスキップ
  }
  const files = fs.readdirSync(docsDir);
  files.forEach(f => {
    if (!/\.(md|txt)$/.test(f)) return;
    const txt = fs.readFileSync(path.join(docsDir, f), 'utf8');
    for (let i = 0; i < txt.length; i += 800) {
      const chunk = txt.slice(i, i + 800);
      store.push({ id: `${f}-${i}`, text: chunk, vec: [] });
    }
  });
  await Promise.all(store.map(d => embed(d.text).then(v => d.vec = v)));
  console.log(`Initialized docs store: ${store.length} chunks`);
}

function cosine(a:number[],b:number[]){
  const dot=a.reduce((s,e,i)=>s+e*(b[i]||0),0);
  const na=Math.hypot(...a), nb=Math.hypot(...b);
  return dot/(na*nb);
}

export async function search(query:string, topN=3) {
  let qv:number[] = [];
  try {
    qv = await embed(query);
  } catch {
    // embed 内でキャッチ済みなので基本ここは通りません
  }
  if (qv.length === 0) {
    console.warn('Vector search skipped: no embedding');
    return [];
  }
  return store
    .map(d=>({ id:d.id, text:d.text, score:cosine(qv,d.vec) }))
    .sort((a,b)=>b.score-a.score)
    .slice(0, topN);
}
