'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { gzipSync } = require('node:zlib');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public');
const routes = ['/', '/index.html', '/page/2/', '/page/54/', '/archives/', '/categories/', '/tags/',
  '/projects/', '/courses/', '/courses/ai-town/', '/courses/network-proxy/', '/about/', '/editor/',
  '/morning-read/', '/mahjong/', '/painters-guild/', '/flipbook/', '/2026/08/21/browser-course-12/'];
function fileFor(url) {
  let pathname = decodeURIComponent(new URL(url, 'https://syfyivan.github.io').pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(output, '.' + pathname);
  assert.ok(file.startsWith(output + path.sep), 'URL must stay inside public output');
  return file;
}

test('all primary navigation, project, pagination and article routes exist', () => {
  for (const route of routes) assert.ok(fs.existsSync(fileFor(route)), `Missing route ${route}`);
});

test('public URLs agree with the generated sitemap and canonical metadata', () => {
  const base = 'https://syfyivan.github.io';
  const robots = fs.readFileSync(fileFor('/robots.txt'), 'utf8');
  assert.ok(robots.includes('Sitemap: ' + base + '/sitemap.xml'));
  const xml = fs.readFileSync(fileFor('/sitemap.xml'), 'utf8');
  const links = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url.replaceAll('&amp;', '&').replaceAll('&apos;', "'"));
  assert.ok(links.length > 500, 'Expected the existing public article collection');
  assert.equal(new Set(links).size, links.length, 'Sitemap URLs must be unique');
  for (const url of links) {
    assert.equal(new URL(url).origin, base);
    assert.ok(!url.endsWith('/index.html'), 'Prefer directory URLs');
    assert.ok(fs.existsSync(fileFor(url)), 'Missing sitemap entry ' + url);
  }
  assert.ok(!links.includes(base + '/editor/'), 'Local editor belongs outside the public sitemap');
  for (const route of ['/', '/about/', '/agent-notes-loop/', '/page/2/']) {
    const html = fs.readFileSync(fileFor(route), 'utf8');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
    assert.ok(canonical, 'Missing canonical URL for ' + route);
    assert.equal(new URL(canonical[1]).href, base + route);
    assert.ok(html.includes('<meta property="og:url" content="' + base + route + '">'), 'Incorrect share URL for ' + route);
  }
  const home = fs.readFileSync(fileFor('/'), 'utf8');
  assert.match(home, /<meta name="description" content="一凡的个人博客，/);
  assert.ok(links.includes(base + '/agent-notes-loop/'));
});

test('category disclosures have unique toggles and correctly linked panels', () => {
  const html = fs.readFileSync(fileFor('/categories/'), 'utf8');
  const toggles = [...html.matchAll(/<a\b[^>]*\bid="(heading-[^"]+)"[^>]*\bhref="#(collapse-[^"]+)"[^>]*>/g)];
  const panels = [...html.matchAll(/<div\b[^>]*\bid="(collapse-[^"]+)"[^>]*\baria-labelledby="(heading-[^"]+)"[^>]*>/g)];
  assert.ok(toggles.length > 0, 'Expected category disclosures');
  assert.equal(new Set(toggles.map(([, headingId]) => headingId)).size, toggles.length, 'Category toggle IDs must be unique');
  const panelLabels = new Map(panels.map(([, panelId, headingId]) => [panelId, headingId]));
  assert.equal(panelLabels.size, panels.length, 'Category panel IDs must be unique');
  assert.equal(panels.length, toggles.length);
  for (const [tag, headingId, panelId] of toggles) {
    assert.equal(panelLabels.get(panelId), headingId, 'Each toggle must label its own panel');
    assert.ok(tag.includes('aria-controls="' + panelId + '"'), 'Each toggle must identify its own panel');
  }
});

test('farm map assets, collection icons and every destination survive static generation', () => {
  const farm = require('../source/js/farm-world-core.js');
  for (const place of farm.places) assert.ok(fs.existsSync(fileFor(place.href)), `Missing farm destination ${place.href}`);
  const icons = new Set(farm.places.concat(farm.discoveries).map(item => item.icon).concat('medal'));
  for (const icon of icons) assert.ok(fs.existsSync(fileFor(`/img/journal/${icon}.svg`)));
  for (const time of ['day', 'night']) assert.ok(fs.statSync(fileFor(`/img/farm-world/${time}.webp`)).size > 50000);
  const atlas = fs.readFileSync(fileFor('/img/farm-world/actions-v2.png'));
  assert.equal(atlas.toString('ascii', 1, 4), 'PNG');
  assert.equal(atlas[25], 6, 'Scene atlas must retain RGBA transparency');
  const html = fs.readFileSync(fileFor('/'), 'utf8');
  for (const asset of ['/js/farm-world-core.js', '/js/farm-world.js', '/css/farm-world.css']) assert.ok(html.includes(asset));
  assert.ok(!html.includes('/js/farm.js?'), 'Old farm renderer must not run alongside the new world');
});

test('all search results resolve to generated articles, without embedded styles', () => {
  const fullJson = fs.readFileSync(path.join(output, 'search-index.json'));
  const previewJson = fs.readFileSync(path.join(output, 'search-preview.json'));
  const entries = JSON.parse(fullJson);
  assert.ok(entries.length > 500, 'Expected the existing article collection');
  assert.deepEqual(JSON.parse(previewJson), entries.map(entry => ({ ...entry, content: entry.content.slice(0, 150) })));
  assert.ok(gzipSync(previewJson).length < gzipSync(fullJson).length / 10, 'First search must avoid downloading the full text');
  for (const entry of entries) {
    assert.ok(fs.existsSync(fileFor(entry.url)), `Broken search result ${entry.url}`);
    assert.equal(typeof entry.title, 'string');
    assert.equal(typeof entry.content, 'string');
  }
  const browser = entries.find(entry => entry.url.includes('browser-course-12/'));
  assert.ok(browser.content.includes('主线已经'));
  assert.ok(!browser.content.includes('.bc-sec{'));
});

test('generated home excerpts are readable and theme search is replaced exactly', () => {
  const html = fs.readFileSync(fileFor('/'), 'utf8');
  assert.ok(html.includes('主线已经'));
  assert.ok(!html.includes('.bc-sec{'));
  assert.ok(html.includes('/css/blog-refinement.css'));
  assert.match(html, /src="\/js\/local-search\.js\?v=[0-9a-f]{12}"/);
  const generatedSearch = fs.readFileSync(path.join(output, 'js/local-search.js'), 'utf8');
  const sourceSearch = fs.readFileSync(path.join(root, 'source/js/local-search.js'), 'utf8');
  assert.equal(generatedSearch, sourceSearch.replace(/\r\n/g, '\n'));
});

test('public home omits the writing entry and the retired usage board', () => {
  const html = fs.readFileSync(fileFor('/'), 'utf8');
  assert.ok(!html.includes('href="/editor/"'), 'Editor link must stay out of the public navigation');
  assert.doesNotMatch(html, /token-usage/);
  const homeScript = fs.readFileSync(fileFor('/js/home-showcase.js'), 'utf8');
  assert.doesNotMatch(homeScript, /token-usage/);
  for (const route of ['/stats/token-usage.json', '/js/token-usage.js', '/css/token-usage.css']) {
    assert.ok(!fs.existsSync(fileFor(route)), `Unexpected route ${route}`);
  }
});

test('shared blog pages reference only existing local scripts, styles and images', () => {
  for (const route of ['/', '/page/2/', '/archives/', '/categories/', '/tags/', '/about/', '/2026/08/21/browser-course-12/']) {
    const html = fs.readFileSync(fileFor(route), 'utf8');
    const resources = [...html.matchAll(/(?:src|href)="(\/(?!\/)[^"<>]+)"/g)].map(match => match[1]).filter(url => /\.(js|css|png|jpe?g|svg|webp)(?:\?|$)/i.test(url));
    for (const resource of resources) assert.ok(fs.existsSync(fileFor(resource)), `${route} has missing asset ${resource}`);
  }
});
