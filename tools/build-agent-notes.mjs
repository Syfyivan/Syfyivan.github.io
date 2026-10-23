import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'tools/agent-notes/outline.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'tools/agent-notes/sections.md'), 'utf8').replace(/\r\n/g, '\n');
const matches = [...source.matchAll(/^<!-- topic:([a-z-]+) -->\n([\s\S]*?)(?=^<!-- topic:|$(?![\s\S]))/gm)];
const topics = new Map(matches.map(match => [match[1], match[2].trim()]));
assert.equal(topics.size, matches.length, 'Each source topic needs one unique identifier');
assert.equal(topics.size, 26, 'The frozen scope contains 26 mechanisms');

function collect(items, result = []) {
  for (const item of items) {
    if (item.id) result.push(item.id);
    if (item.items) collect(item.items, result);
  }
  return result;
}

function render(items, depth) {
  return items.map(item => {
    const anchor = item.id ? `<a id="${item.id}"></a>\n\n` : '';
    const heading = `${'#'.repeat(depth)} ${item.title}\n\n`;
    const intro = item.intro ? `${item.intro}\n\n` : '';
    const body = item.id ? `${topics.get(item.id)}\n\n` : '';
    const children = item.items ? render(item.items, depth + 1) : '';
    return anchor + heading + intro + body + children;
  }).join('');
}

function document(article) {
  const ids = collect(article.sections);
  assert.equal(new Set(ids).size, ids.length, `${article.key}: topic occurs more than once`);
  assert.deepEqual([...ids].sort(), [...topics.keys()].sort(), `${article.key}: incomplete topic coverage`);
  for (const [id, body] of topics) {
    assert.ok(body.length > 180, `${id}: missing mechanism explanation`);
  }
  const metadata = [
    '---',
    `title: ${JSON.stringify(article.title)}`,
    'date: 2026-10-23 09:00:00',
    'updated: 2026-10-23 09:00:00',
    `permalink: ${article.route.slice(1)}`,
    `description: ${JSON.stringify(article.description)}`,
    'tags: [AI Agent, Agent Runtime, 上下文, RAG, Memory]',
    'categories: [技术笔记, Agent 系统笔记]',
    'toc: true',
    '---',
    '',
    article.intro,
    '',
    `这是单页完整笔记，核对日期为 **${config.verifiedAt}**。另一种组织方式见[${article.key === 'system' ? '按主干五步展开的版本' : '按系统职责展开的版本'}](${article.other})。两篇包含相同机制，阅读任一篇即可取得完整内容。`,
    '',
    '<!-- more -->',
    '',
  ].join('\n');
  const content = (metadata + '\n' + render(article.sections, 2)).trimEnd() + '\n';
  const anchors = [...content.matchAll(/<a id="([^"]+)"><\/a>/g)].map(match => match[1]);
  assert.equal(anchors.length, new Set(anchors).size, 'Duplicate semantic anchor');
  for (const match of content.matchAll(/\]\(#([^\)]+)\)/g)) {
    assert.ok(anchors.includes(match[1]), `${article.key}: broken reference ${match[1]}`);
  }
  const headings = content.split('\n').filter(line => /^#{2,6} /.test(line));
  let previousDepth = 1;
  for (const heading of headings) {
    const depth = heading.match(/^#+/)[0].length;
    assert.ok(depth <= previousDepth + 1, `${article.key}: skipped heading level`);
    previousDepth = depth;
  }
  assert.ok(!/\uFFFD|TODO|待补充正文|此处省略|详见另一篇/.test(content), 'Incomplete or damaged article');
  assert.ok(!/\{%\s*include/.test(content), 'Published articles must contain their own full body');
  for (const line of content.split('\n')) {
    if (/^\|/.test(line)) {
      assert.ok(line.endsWith('|'), 'Markdown table row missing delimiter');
    }
  }
  return { article, content, headings, ids };
}

const outputs = config.articles.map(document);
const summary = outputs.map(({article, content, headings, ids}) => ({
  file: article.file, route: article.route, characters: content.length,
  headings: headings.length, topics: ids.length,
  sha256: createHash('sha256').update(content).digest('hex'),
}));

if (process.argv.includes('--patch')) {
  const chunks = ['*** Begin Patch'];
  for (const output of outputs) {
    const target = path.join(root, 'source/_posts', output.article.file).replaceAll('\\', '/');
    if (fs.existsSync(target)) {
      const current = fs.readFileSync(target, 'utf8');
      if (current === output.content) continue;
      const oldLines = current.replace(/\r\n/g, '\n').trimEnd().split('\n');
      const newLines = output.content.trimEnd().split('\n');
      let prefix = 0;
      while (prefix < oldLines.length && prefix < newLines.length && oldLines[prefix] === newLines[prefix]) prefix++;
      let suffix = 0;
      while (suffix < oldLines.length - prefix && suffix < newLines.length - prefix && oldLines[oldLines.length - 1 - suffix] === newLines[newLines.length - 1 - suffix]) suffix++;
      const start = Math.max(0, prefix - 2);
      const oldEnd = Math.min(oldLines.length, oldLines.length - suffix + 2);
      const newEnd = Math.min(newLines.length, newLines.length - suffix + 2);
      chunks.push(`*** Update File: ${target}`, '@@');
      chunks.push(...oldLines.slice(start, oldEnd).map(line => '-' + line));
      chunks.push(...newLines.slice(start, newEnd).map(line => '+' + line));
    } else {
      chunks.push(`*** Add File: ${target}`);
      chunks.push(...output.content.trimEnd().split('\n').map(line => '+' + line));
    }
  }
  chunks.push('*** End Patch');
  process.stdout.write(JSON.stringify({ summary, patch: chunks.join('\n') }));
} else {
  for (const {article, content, ids} of outputs) {
    const target = path.join(root, 'source/_posts', article.file);
    assert.equal(fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n'), content, `${article.file}: stale generated article`);
    if (process.argv.includes('--built')) {
      const generated = path.join(root, 'public', article.route, 'index.html');
      const html = fs.readFileSync(generated, 'utf8');
      assert.ok(html.includes(article.title), `${article.file}: missing rendered title`);
      const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      assert.equal(htmlIds.length, new Set(htmlIds).size, `${article.file}: duplicate rendered HTML id`);
      for (const id of ids) assert.equal(htmlIds.filter(value => value === id).length, 1, `${article.file}: missing mechanism ${id}`);
      const localLinks = [...html.matchAll(/href="#([^"]+)"/g)].map(match => decodeURIComponent(match[1]));
      for (const id of localLinks) assert.ok(htmlIds.includes(id), `${article.file}: broken rendered anchor ${id}`);
      assert.ok(html.includes(article.other), `${article.file}: missing other-version link`);
      assert.ok(!html.includes('<!-- topic:'), 'Editorial source markers leaked');
      assert.equal(fs.readdirSync(path.dirname(generated)).filter(name => name.endsWith('.html')).length, 1, 'One article must produce one HTML entry');
    }
  }
  process.stdout.write(JSON.stringify({ verifiedAt: config.verifiedAt, articles: summary, status: 'passed' }, null, 2) + '\n');
}
