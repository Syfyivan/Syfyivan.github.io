import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
// The Hexo package is CommonJS. Load the standalone browser modules without changing it.
const load = async (name) => import(`data:text/javascript;base64,${Buffer.from(await readFile(new URL(`../source/reading-lab/${name}.js`, import.meta.url))).toString('base64')}`);
const { classifyLevel, normalizeAnswer, parseWords, buildPool, wrapText, shuffle, summarize } = await load('core');
const { WORDS, STORIES } = await load('data');

test('every literal ID lookup in the app resolves to one HTML element', async () => {
  const [html, app] = await Promise.all([
    readFile(new URL('../source/reading-lab/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../source/reading-lab/app.js', import.meta.url), 'utf8')
  ]);
  const ids = [...html.matchAll(/<[^>]*\bid\s*=\s*(["'])(.*?)\1[^>]*>/gu)].map(match => match[2]);
  const uniqueIds = new Set(ids);
  assert.equal(uniqueIds.size, ids.length, 'duplicate HTML IDs make getElementById ambiguous');
  const lookups = [...app.matchAll(/(?<![\w$])\$\(\s*(["'`])([^"'`]*?)\1\s*\)/gu)]
    .filter(match => !match[2].includes('${'));
  assert.ok(lookups.length > 30, 'the contract must inspect the actual application ID lookups');
  const missing = [...new Set(lookups.map(match => match[2]).filter(id => !uniqueIds.has(id)))];
  assert.deepEqual(missing, [], 'the $ helper accepts an existing ID, not a CSS selector');
});

test('classify display widths at every boundary, including Unicode', () => {
  for (const [text, level] of [['学', 1], ['𠮷祥', 1], ['数据库', 2], ['操作系统', 2], ['自然语言处理', 3], ['一二三四五六七八九', 4]]) assert.equal(classifyLevel(text, 'zh'), level);
  for (const [text, level] of [['code', 1], ['model', 2], ['network', 2], ['function', 3], ['understand', 3], ['neural network', 4]]) assert.equal(classifyLevel(text, 'en'), level);
  assert.equal(classifyLevel('0123', 'number'), 2);
  assert.throws(() => classifyLevel('text', 'unknown'));
});

test('all accepted length boundaries stay in their declared difficulty tier', () => {
  for (const [type, glyph, tiers] of [['zh', '字', [[1, 2], [3, 4], [5, 8], [9, 24]]], ['number', '0', [[1, 2], [3, 4], [5, 8], [9, 24]]], ['en', 'a', [[2, 4], [5, 7], [8, 10], [11, 40]]]]) {
    tiers.forEach(([min, max], index) => {
      for (const length of [min, max]) {
        const { words, rejected } = parseWords(glyph.repeat(length), type);
        assert.equal(rejected.length, 0);
        assert.equal(words[0].level, index + 1, `${type}/${length}`);
      }
    });
  }
});

test('answer normalization preserves English word boundaries', () => {
  assert.equal(normalizeAnswer('  Neural   NETWORK\n'), 'neural network');
  assert.notEqual(normalizeAnswer('ab c'), normalizeAnswer('a bc'));
  assert.equal(normalizeAnswer('１２３'), '123');
});

test('TXT uses explicit selected type; JSON and backups preserve item metadata', () => {
  const result = parseWords('\uFEFF苹果\r\n\n雨伞\n苹果\n123\nhello', 'zh');
  assert.equal(result.words.length, 2);
  assert.equal(result.rejected.length, 3);
  assert.deepEqual(result.words[0], { text: '苹果', type: 'zh', category: 'custom', level: 1 });
  const backup = parseWords(JSON.stringify({ words: [{ text: 'Neural network', type: 'en', category: 'ai', level: 1 }, { text: '0123', type: 'number', category: 'custom' }] }));
  assert.equal(backup.words[0].level, 4);
  assert.equal(backup.words[1].text, '0123');
  assert.equal(parseWords('["hello", "world"]', 'en').words.length, 2);
  assert.equal(parseWords('hello', 'zh').words.length, 0);
  assert.equal(parseWords('123', 'en').words.length, 0);
});

test('malformed and oversized imports report rejections and never execute content', () => {
  assert.equal(parseWords('{oops').rejected.length, 1);
  assert.equal(parseWords('{"data":[]}').rejected.length, 1);
  const invalid = [null, 17, {}, { text: 'hello', type: 'xxx' }, { text: 'hello', type: 'en', category: 'oops' }, { text: '字'.repeat(25) }, { text: 'a'.repeat(41), type: 'en' }, '<img src=x onerror=alert(1)>'];
  assert.equal(parseWords(JSON.stringify(invalid)).rejected.length, invalid.length);
  const huge = Array.from({ length: 5002 }, (_, i) => String(i));
  assert.equal(parseWords(JSON.stringify(huge), 'number').words.length, 5000);
  assert.equal(parseWords(JSON.stringify(huge), 'number').rejected.length, 2);
});

test('pool selection combines all constraints and empty choices stay empty', () => {
  const sample = [{ text: 'a', type: 'en', category: 'daily', level: 1 }, { text: 'b', type: 'en', category: 'ai', level: 1 }, { text: 'c', type: 'zh', category: 'ai', level: 2 }];
  assert.deepEqual(buildPool(sample, ['en'], ['ai'], 1), [sample[1]]);
  assert.deepEqual(buildPool(sample, [], ['ai'], 1), []);
  assert.deepEqual(buildPool(sample, ['en'], [], 1), []);
});

test('custom numeric imports keep leading zeros and participate in mixed pools', () => {
  const { words } = parseWords(JSON.stringify([{ text: '0012', type: 'number' }, { text: '书签', type: 'zh' }, { text: 'cache', type: 'en' }]));
  assert.deepEqual(buildPool(words, ['number', 'en'], ['custom'], 2).map(word => word.text), ['0012', 'cache']);
  assert.deepEqual(buildPool(words, ['number'], ['daily'], 2), []);
  const invalid = parseWords('12 34\n-123\n12.3\n一二三\n' + '1'.repeat(25), 'number');
  assert.equal(invalid.words.length, 0);
  assert.equal(invalid.rejected.length, 5);
});

test('wrapping preserves text, Unicode and English words without punctuation at line starts', () => {
  const text = '𠮷祥的清晨，我们沿河散步。读一本书！';
  const lines = wrapText(text, 5);
  assert.equal(lines.join(''), text);
  assert.ok(lines.every(line => !/^[，。！]/u.test(line)));
  assert.deepEqual(wrapText('hello world computational thinking', 10), ['hello', 'world', 'computatio', 'nal', 'thinking']);
  assert.deepEqual(wrapText('第一段\n\n第二段', 10), ['第一段', '第二段']);
  assert.deepEqual(wrapText('', 20), []);
  const quotation = '他说：“今天晴天。”然后出门。';
  const quotedLines = wrapText(quotation, 12);
  assert.equal(quotedLines.join(''), quotation);
  assert.ok(quotedLines.every(line => !/^[，。！？”]/u.test(line)), 'closing quotation marks must stay with the sentence');
});

test('oversized English tokens and URLs split safely for narrow viewports', () => {
  for (const width of [8, 12, 20]) {
    for (const text of ['a'.repeat(100), 'https://example.com/' + 'b'.repeat(100)]) {
      const lines = wrapText(text, width);
      assert.equal(lines.join(''), text);
      assert.ok(lines.every(line => Array.from(line).length <= width + 1));
    }
  }
  assert.deepEqual(wrapText('machine learning', 10), ['machine', 'learning']);
});

test('shuffle copies input; summary counts only correct answers', () => {
  const items = [1, 2, 3, 4];
  assert.deepEqual(shuffle(items).sort(), items);
  assert.deepEqual(items, [1, 2, 3, 4]);
  assert.notEqual(shuffle(items), items);
  assert.deepEqual(summarize([{ correct: true }, { correct: false }, { correct: true }]), { correct: 2, total: 3, accuracy: 67 });
  assert.deepEqual(summarize([]), { correct: 0, total: 0, accuracy: 0 });
});

test('every content bank has eight valid entries per category, language and level', () => {
  assert.equal(new Set(WORDS.map(word => `${word.type}:${word.category}:${normalizeAnswer(word.text)}`)).size, WORDS.length);
  for (const category of ['daily', 'school', 'computer', 'ai']) for (const type of ['zh', 'en']) for (const level of [1, 2, 3, 4]) {
    const entries = buildPool(WORDS, [type], [category], level);
    assert.ok(entries.length >= 8, `${category}/${type}/${level}: not enough words`);
    for (const item of entries) {
      assert.equal(classifyLevel(item.text, type), level, `${item.text}: wrong level`);
      assert.equal(parseWords(JSON.stringify([item])).rejected.length, 0, `${item.text}: invalid`);
    }
  }
});

test('stories have substantial text and three unambiguous quiz records', () => {
  assert.ok(STORIES.length >= 3);
  assert.equal(new Set(STORIES.map(story => story.id)).size, STORIES.length);
  for (const story of STORIES) {
    const length = Array.from(story.text.replace(/\s/gu, '')).length;
    assert.ok(length >= 400 && length <= 650, `${story.id}: ${length} characters`);
    assert.equal(story.questions.length, 3);
    assert.ok(story.keypoints.length >= 3);
    for (const question of story.questions) { assert.equal(question.options.length, 4); assert.equal(new Set(question.options).size, 4); assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4); }
    for (const width of [12, 20, 32]) assert.equal(wrapText(story.text, width).join(''), story.text.replace(/\s/gu, ''), `${story.id}: wrapping must preserve the entire story`);
  }
});
