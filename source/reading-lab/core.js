const CATEGORIES = new Set(['daily', 'school', 'computer', 'ai', 'custom']);
const lengthOf = (text) => Array.from(text).length;

export function normalizeAnswer(text) {
  return String(text ?? '').normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase();
}

export function classifyLevel(text, type) {
  const n = lengthOf(String(text).trim());
  if (type === 'zh' || type === 'number') return n <= 2 ? 1 : n <= 4 ? 2 : n <= 8 ? 3 : 4;
  if (type === 'en') return n <= 4 ? 1 : n <= 7 ? 2 : n <= 10 ? 3 : 4;
  throw new TypeError('类型必须为 zh、en 或 number');
}

export function parseWords(raw, defaultType = 'zh', defaultCategory = 'custom') {
  const words = [], rejected = [], seen = new Set();
  let rows;
  const source = String(raw ?? '').replace(/^\uFEFF/u, '').trim();
  if (!source) return { words, rejected };
  if (/^[\[{]/u.test(source)) {
    try {
      const parsed = JSON.parse(source);
      rows = Array.isArray(parsed) ? parsed : parsed?.words;
      if (!Array.isArray(rows)) throw new Error();
    } catch {
      return { words, rejected: [{ line: 1, reason: 'JSON 格式无效，需数组或含 words 数组的对象' }] };
    }
  } else rows = source.split(/\r?\n/u);
  rows.forEach((row, index) => {
    if (typeof row === 'string' && !row.trim()) return;
    const fail = (reason) => rejected.push({ line: index + 1, reason });
    if (index >= 5000) return fail('超过 5000 条上限');
    if (typeof row !== 'string' && (!row || typeof row !== 'object' || Array.isArray(row))) return fail('词条必须为文本或对象');
    const item = typeof row === 'string' ? { text: row } : row;
    if (typeof item.text !== 'string') return fail('缺少文本');
    const text = item.text.normalize('NFKC').trim().replace(/\s+/gu, ' ');
    const type = item.type ?? defaultType;
    const category = item.category ?? defaultCategory;
    if (!['zh', 'en', 'number'].includes(type)) return fail('未知类型');
    if (!CATEGORIES.has(category)) return fail('未知分类');
    if (!text || lengthOf(text) > (type === 'en' ? 40 : 24)) return fail('词条为空或超过长度上限');
    if (type === 'number' && !/^\d+$/u.test(text)) return fail('数字词条只能包含数字');
    if (type === 'zh' && !/\p{Script=Han}/u.test(text)) return fail('中文词条需包含汉字');
    if (type === 'en' && (!/^[a-z][a-z\s'’.-]*$/iu.test(text) || lengthOf(text) < 2)) return fail('英文词条需为至少两个字符的单词或短语');
    const key = `${type}:${category}:${normalizeAnswer(text)}`;
    if (seen.has(key)) return fail('重复词条');
    seen.add(key);
    words.push({ text, type, category, level: classifyLevel(text, type) });
  });
  return { words, rejected };
}

export function buildPool(words, types, categories, level) {
  return words.filter((word) => types.includes(word.type) && categories.includes(word.category) && word.level === Number(level));
}

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function summarize(results) {
  const total = results.length;
  const correct = results.filter((result) => result === true || result?.correct === true).length;
  return { correct, total, accuracy: total ? Math.round(correct / total * 100) : 0 };
}

export function wrapText(text, width = 20) {
  const max = Math.max(1, Math.floor(Number(width) || 20));
  const lines = [];
  for (const paragraph of String(text).replace(/\r/gu, '').split('\n')) {
    if (!paragraph.trim()) continue;
    // Keep ordinary English words intact; split oversized tokens to protect narrow screens.
    const tokens = (paragraph.trim().match(/[a-zA-Z]+(?:['’-][a-zA-Z]+)*|\s+|./gu) || []).flatMap(token => {
      const points = Array.from(token);
      if (points.length <= max || /^\s+$/u.test(token)) return [token];
      const chunks = [];
      for (let start = 0; start < points.length; start += max) chunks.push(points.slice(start, start + max).join(''));
      return chunks;
    });
    let line = '';
    for (const token of tokens) {
      if (/^\s+$/u.test(token)) { if (line && !line.endsWith(' ')) line += ' '; continue; }
      const punctuation = /^[，。！？；：、,.!?;:）》」』”’]$/u.test(token);
      if (!line && punctuation && lines.length) {
        lines[lines.length - 1] += token;
        continue;
      }
      if (line && lengthOf(line + token) > max && !punctuation) {
        lines.push(line.trimEnd());
        line = '';
      }
      line += token;
      if (/[。！？!?；;]/u.test(token) && lengthOf(line) >= max * 0.65) {
        lines.push(line.trim()); line = '';
      }
    }
    if (line.trim()) lines.push(line.trim());
  }
  return lines;
}
