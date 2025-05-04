export type WebResult = { title: string; url: string };

export async function webSearch(query: string, topN = 5): Promise<WebResult[]> {
  // DuckDuckGo HTML 版のスクレイピング
  const ddgUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  console.log('WebSearch: fetching DuckDuckGo URL:', ddgUrl);
  let html = '';
  try {
    const res = await fetch(ddgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    html = await res.text();
    console.log('WebSearch: DuckDuckGo HTML length:', html.length);
  } catch (err) {
    console.error('WebSearch: DuckDuckGo fetch error:', err);
  }

  const results: WebResult[] = [];
  const re = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/g;
  let m: RegExpExecArray | null;
  while (html && (m = re.exec(html)) && results.length < topN) {
    const title = m[2].replace(/<[^>]+>/g, '');
    results.push({ title, url: m[1] });
  }
  console.log(`WebSearch: DuckDuckGo results found: ${results.length}`);

  // フォールバック：Wikipedia 日本語検索
  if (results.length === 0) {
    const wikiUrl = `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=${topN}`;
    console.log('WebSearch: fetching Wikipedia API URL:', wikiUrl);
    try {
      const data = await fetch(wikiUrl).then(r => r.json());
      const items = data?.query?.search;
      console.log('WebSearch: Wikipedia search items:', items?.length);
      if (Array.isArray(items)) {
        for (const item of items) {
          if (results.length >= topN) break;
          const title = item.title;
          const url = `https://ja.wikipedia.org/wiki/${encodeURIComponent(title)}`;
          results.push({ title, url });
        }
      }
    } catch (err) {
      console.error('WebSearch: Wikipedia fetch error:', err);
    }
  }

  console.log('WebSearch: final results:', results);
  return results;
}
