const NOISE = ['a','the','um','uh'];
export function validateQuery(q: string): boolean {
  if (!q || q.length>256) return false;
  if (/[\x00-\x1F]/.test(q)) return false;
  const clean = q.replace(/[\p{P}\p{S}]/gu, '');
  if (NOISE.includes(clean.toLowerCase())) return false;
  return true;
}
